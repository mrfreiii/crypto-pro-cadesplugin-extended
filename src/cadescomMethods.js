////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Object create
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @description объект для создания асинхроннного/синхранного объекта методом cadesplugin
 */
const cadesMethods = Object.create(null)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Methods
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @method init
 * @param {Object} args объект инициализирующих значений
 * @description метод-конструктор
 */
cadesMethods.init = function init(args) {
  this.O_STORE = args.O_STORE
  this.O_ATTS = args.O_ATTS
  this.O_SIGNED_DATA = args.O_SIGNED_DATA
  this.O_SIGNER = args.O_SIGNER
  this.O_SIGNED_XML = args.O_SIGNED_XML
  this.O_ABOUT = args.O_ABOUT
  this.O_HASHED_DATA = args.O_HASHED_DATA
}

/**
 * @async
 * @method createObject
 * @param {String} method
 * @returns {Method}
 * @description выбирает доступный метод для текущего браузера
 */
cadesMethods.createObject = async function createObject(method) {
  const supportedMethod = (await window.cadesplugin.CreateObject)
    ? await window.cadesplugin.CreateObject(method)
    : await window.cadesplugin.CreateObjectAsync(method)

  return supportedMethod
}

/**
 * @method oStore
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oStore = function oStore() {
  return this.createObject(this.O_STORE)
}
/**
 * @method oAtts
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oAtts = function oAtts() {
  return this.createObject(this.O_ATTS)
}
/**
 * @method oSignedData
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oSignedData = function oSignedData() {
  return this.createObject(this.O_SIGNED_DATA)
}
/**
 * @method oSigner
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oSigner = function oSigner() {
  return this.createObject(this.O_SIGNER)
}
/**
 * @method oSignedXml
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oSignedXml = function oSignedXml() {
  return this.createObject(this.O_SIGNED_XML)
}
/**
 * @method oAbout
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oAbout = function oAbout() {
  return this.createObject(this.O_ABOUT)
}
/**
 * @method oHashedData
 * @returns {Object}
 * @description возвращает созданный объект
 */
cadesMethods.oHashedData  = function oHashedData () {
  return this.createObject(this.O_HASHED_DATA)
}

const cadescomMethods = Object.create(cadesMethods)

cadescomMethods.init({
  O_STORE: 'CAdESCOM.Store',
  O_ATTS: 'CADESCOM.CPAttribute',
  O_SIGNED_DATA: 'CAdESCOM.CadesSignedData',
  O_SIGNER: 'CAdESCOM.CPSigner',
  O_SIGNED_XML: 'CAdESCOM.SignedXML',
  O_ABOUT: 'CAdESCOM.About',
  O_HASHED_DATA : 'CAdESCOM.HashedData',
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTE Exports
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = cadescomMethods
