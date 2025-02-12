'use strict';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Imports
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CertificateAdjuster = require('./certificateAdjuster');
const cadescomMethods = require('./cadescomMethods');
const { doXmlSitnatureAlgorithm, doXmlSitnatureType } = require('./xmlSitnatureMethods');
const {
  CAPICOM: {
    CAPICOM_CURRENT_USER_STORE,
    CAPICOM_MY_STORE,
    CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED,
    CAPICOM_CERTIFICATE_FIND_SHA1_HASH,
    CAPICOM_CERTIFICATE_FIND_TIME_VALID,
    CAPICOM_CERTIFICATE_FIND_EXTENDED_PROPERTY,
    CAPICOM_PROPID_KEY_PROV_INFO,
    CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME,
    CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY
  },
  CADESCOM: {
    CADESCOM_BASE64_TO_BINARY,
    CADESCOM_CADES_BES,
    CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED,
    CADESCOM_HASH_ALGORITHM_CP_GOST_3411,
    CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256,
    CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512
  }
} = require('./constants');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Object create
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @description объект предоставляет методы для получения данных о сертификатах, а так же для их подписания
 */
const CertificatesApi = Object.create(null);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Methods
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @async
 * @method about
 * @description выводит информацию
 */
CertificatesApi.about = async function about() {
  try {
    return await cadescomMethods.oAbout();
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method getCertsList
 * @throws {Error}
 * @description получает массив валидных сертификатов
 */
CertificatesApi.getCertsList = async function getCertsList() {
  try {
    const oStore = await cadescomMethods.oStore();
    await oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

    const certificates = await oStore.Certificates;

    if (!certificates) {
      throw new Error('Нет доступных сертификатов');
    }

    const findCertificate = await certificates.Find(CAPICOM_CERTIFICATE_FIND_TIME_VALID);
    const findCertsWithPrivateKey = await findCertificate.Find(CAPICOM_CERTIFICATE_FIND_EXTENDED_PROPERTY, CAPICOM_PROPID_KEY_PROV_INFO);

    const count = await findCertsWithPrivateKey.Count;

    if (!count) {
      throw new Error('Нет сертификатов с приватным ключём');
    }

    const createCertList = [];

    for (let index = 0; index < count; index++) {
      const certApi = await findCertsWithPrivateKey.Item(index + 1);
      const certificateAdjuster = Object.create(CertificateAdjuster);

      certificateAdjuster.init({
        certApi,
        issuerInfo: await certApi.IssuerName,
        privateKey: await certApi.PrivateKey,
        serialNumber: await certApi.SerialNumber,
        subjectInfo: await certApi.SubjectName,
        thumbprint: await certApi.Thumbprint,
        validPeriod: {
          from: await certApi.ValidFromDate,
          to: await certApi.ValidToDate
        }
      });

      createCertList.push(certificateAdjuster);
    }

    oStore.Close();

    return createCertList;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method currentCadesCert
 * @param {String} thumbprint значение сертификата
 * @throws {Error}
 * @description получает сертификат по thumbprint значению сертификата
 */
CertificatesApi.currentCadesCert = async function currentCadesCert(thumbprint) {
  try {
    if (!thumbprint) {
      throw new Error('Не указано thumbprint значение сертификата');
    } else if (typeof thumbprint !== 'string') {
      throw new Error('Не валидное значение thumbprint сертификата');
    }
    const oStore = await cadescomMethods.oStore();

    await oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

    const certificates = await oStore.Certificates;
    const count = await certificates.Count;
    const findCertificate = await certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);
    if (count) {
      const certificateItem = await findCertificate.Item(1);
      oStore.Close();

      return certificateItem;
    } else {
      throw new Error(`Произошла ошибка при получении сертификата по thumbprint значению: ${thumbprint}`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method getCert
 * @param {String} thumbprint значение сертификата
 * @throws {Error}
 * @description
 * Получает сертификат по thumbprint значению сертификата.
 * В отличие от currentCadesCert использует для поиска коллбек функцию getCertsList
 * С помощью этой функции в сертификате доступны методы из certificateAdjuster
 */
CertificatesApi.getCert = async function getCert(thumbprint) {
  try {
    if (!thumbprint) {
      throw new Error('Не указано thumbprint значение сертификата');
    } else if (typeof thumbprint !== 'string') {
      throw new Error('Не валидное значение thumbprint сертификата');
    }

    const certList = await this.getCertsList();

    for (let index = 0; index < certList.length; index++) {
      if (thumbprint === certList[index].thumbprint) {
        return await certList[index];
      }
    }

    throw new Error(`Не найдено сертификата по thumbprint значению: ${thumbprint}`);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method signBase64
 * @param {String} thumbprint значение сертификата
 * @param {String} base64 строка в формате base64
 * @param {Boolean} type тип подписи true=откреплённая false=прикреплённая
 * @throws {Error}
 * @description подпись строки в формате base64
 */
CertificatesApi.signBase64 = async function signBase64(thumbprint, base64, type = true) {
  try {
    if (!thumbprint) {
      throw new Error('Не указано thumbprint значение сертификата');
    } else if (typeof thumbprint !== 'string') {
      throw new Error('Не валидное значение thumbprint сертификата');
    }

    const oAttrs = await cadescomMethods.oAtts();
    const oSignedData = await cadescomMethods.oSignedData();
    const oSigner = await cadescomMethods.oSigner();
    const currentCert = await this.currentCadesCert(thumbprint);
    const authenticatedAttributes2 = await oSigner.AuthenticatedAttributes2;

    await oAttrs.propset_Name(CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME);
    await oAttrs.propset_Value(new Date());
    await authenticatedAttributes2.Add(oAttrs);
    await oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
    await oSignedData.propset_Content(base64);
    await oSigner.propset_Certificate(currentCert);
    await oSigner.propset_Options(CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY);

    return await oSignedData.SignCades(oSigner, CADESCOM_CADES_BES, type);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method signXml
 * @param {String} thumbprint значение сертификата
 * @param {String} xml строка в формате XML
 * @param {Number} CADESCOM_XML_SIGNATURE_TYPE тип подписи 0=Вложенная 1=Оборачивающая 2=по шаблону @default 0
 * @description подписание XML документа
 */
CertificatesApi.signXml = async function signXml(thumbprint, xml, cadescomXmlSignatureType = CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED) {
  try {
    const currentCert = await this.currentCadesCert(thumbprint);
    const publicKey = await currentCert.PublicKey();
    const algorithm = await publicKey.Algorithm;
    const value = await algorithm.Value;
    const oSigner = await cadescomMethods.oSigner();
    const oSignerXML = await cadescomMethods.oSignedXml();

    const { signAlgorithm, hashAlgorithm } = doXmlSitnatureAlgorithm(value);
    const xmlSitnatureType = doXmlSitnatureType(cadescomXmlSignatureType);

    await oSigner.propset_Certificate(currentCert);
    await oSignerXML.propset_Content(xml);
    await oSignerXML.propset_SignatureType(xmlSitnatureType);
    await oSignerXML.propset_SignatureMethod(signAlgorithm);
    await oSignerXML.propset_DigestMethod(hashAlgorithm);

    return await oSignerXML.Sign(oSigner);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method verifyBase64
 * @param {String} base64 строка в формате base64
 * @param {String} signature подпись
 * @param {Boolean} type тип подписи true=откреплённая false=прикреплённая
 * @throws {Error}
 * @description
 * проверка подписи для строки base64
 * возвращает undefined если подпись валидная
 */
CertificatesApi.verifyBase64 = async function verify(base64, signature, type = true) {
  try {
    if (!base64) {
      throw new Error('Не указаны данные для подписи');
    }

    if (!signature) {
      throw new Error('Не указана подпись');
    }

    const oSignedData = await cadescomMethods.oSignedData();

    await oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
    await oSignedData.propset_Content(base64);

    return await oSignedData.VerifyCades(signature, CADESCOM_CADES_BES, type);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @async
 * @method getHashByGOST
 * @param {String} base64 строка в формате base64
 * @param {number} type число, определяющее тип ГОСТ:
 *        1 - ГОСТ Р 34.11-94;
 *        2 - ГОСТ Р 34.11-2012 256 бит;
 *        3 - ГОСТ Р 34.11-2012 512 бит;
 * @throws {Error}
 * @description вычисление хеш-значения бинарных данных по ГОСТ 3411
 */
CertificatesApi.getHashByGOST = async function getHashByGOST(base64, type = 2) {
  try {
    if (!base64) {
      throw new Error('Не указаны данные для хеширования');
    }

    const oHashedData = await cadescomMethods.oHashedData();

    let algorithm;
    switch (type) {
      case 1:
        algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
        break;
      case 3:
        algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512;
        break;
      case 2:
      default:
        algorithm = CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256;
        break;
    }

    await oHashedData.propset_Algorithm(algorithm);
    await oHashedData.propset_DataEncoding(CADESCOM_BASE64_TO_BINARY);

    await oHashedData.Hash(base64);

    return await oHashedData.Value;
  } catch (error) {
    throw new Error(error.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Exports
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = CertificatesApi;