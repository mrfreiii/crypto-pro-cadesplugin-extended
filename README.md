# cadesplugin-extended

#### Forked from: https://github.com/bad4iz/crypto-pro-cadesplugin

### Изменения:
* Обновлена версия плагина **cadesplugin_api.js** (от 15.02.2024)
* Добавлены методы:
  - **verifyBase64(base64, signature, type)**
  - **getHashByGOST(base64, type)**

### Проверка подписи
**verifyBase64(base64, signature, type)**\
Значение ``type`` по умолчанию ``true``(откреплённая подпись, аналогично методу <b>signBase64</b>).\
Метод возвращает ``undefined``, если подпись валидная.
```js
const api = await ccpa();
const sign = await api.signBase64(thumbprint, dataInBase64);

const verificationResult = await api.verifyBase64(dataInBase64, sign);
```

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