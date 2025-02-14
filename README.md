# cadesplugin-extended

#### Forked from: https://github.com/bad4iz/crypto-pro-cadesplugin

### Изменения:
* Обновлена версия плагина **cadesplugin_api.js** (от 15.02.2024)
* Добавлены методы:
  - **verifyBase64(base64, signature, type)**
  - **getHashByGOST(base64, type)**
  - **getSignatureInfo(base64, signature, type)**

<br/>

### Проверка подписи
**verifyBase64(base64, signature, type)**\
Значение ``type`` по умолчанию ``true``(откреплённая подпись, аналогично методу <b>signBase64</b>).\
Метод возвращает ``true`` для валидной подписи и ``false`` для невалидной.
```js
const api = await ccpa();
const sign = await api.signBase64(thumbprint, dataInBase64);

const isValid = await api.verifyBase64(dataInBase64, sign);
```
<br/>

### Вычисление хеш-значения по ГОСТ
**getHashByGOST(base64, type)**\
Возможные значения ``type``:\
``1`` - ГОСТ Р 34.11-94\
``2`` - ГОСТ Р 34.11-2012 256 бит (значение по умолчанию)\
``3`` - ГОСТ Р 34.11-2012 512 бит
```js
const api = await ccpa();

const hash = await api.getHashByGOST(dataInBase64);
```
<br/>

### Получение информации из подписи
**getSignatureInfo(base64, signature, type)**\
Значение ``type`` по умолчанию ``true``(откреплённая подпись, аналогично методу <b>signBase64</b>).\
Метод возвращает 2 значения: ``signerInfo`` и ``signingTime``.
```js
const api = await ccpa();
const sign = await api.signBase64(thumbprint, dataInBase64);

const signatureInfo = await api.getSignatureInfo(dataInBase64, sign);
```