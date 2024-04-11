# Ideahut Quasar Admin

- UI Admin untuk library [Ideahut Spring Boot](https://github.com/ideahut-apps-team/ideahut-springboot-docs/)
- Mendukung Versi 2x dan 3x

## Install
```bash
npm install
npm run lint --fix
icongenie generate -m spa -i icon-512x512.png
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Build the app for production
```bash
quasar build
```
- *) Aplikasi yang sudah di-_build_ (folder: dist), bisa digunakan sebagai static resource di backend.

### Environment (file: .env)
```md
APP_NAME=Admin
PUBLIC_PATH=/_
API_URL=http://localhost:5401/admin
#API_URL=/admin
API_TIMEOUT=60
DEFAULT_LANGUAGE=en
DEVELOPMENT=true
```
- `PUBLIC_PATH` path untuk akses static resource di backend.
- `API_URL` untuk static resource yang akan di-_embed_ ke backend cukup dengan path API admin tanpa protokol, host, dan port ("/admin"). 

### Backend
* [Springboot 3x MVC](https://github.com/thomson470/ideahut-springboot-3x-template-mvc)
* [Springboot 3x Reactive](https://github.com/thomson470/ideahut-springboot-3x-template-flux)
* [Springboot 3x Native](https://github.com/thomson470/ideahut-springboot-3x-template-native)
* [Springboot 2x MVC](https://github.com/thomson470/ideahut-springboot-2x-template-mvc)
* [Springboot 2x Reactive](https://github.com/thomson470/ideahut-springboot-2x-template-flux)


### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).


# Ideahut Quasar Admin

Ideahut Quasar Admin

## Install the dependencies
```bash
yarn
# or
npm install
```


## Prepare
```bash
npm run lint --fix
icongenie generate -m spa -i icon-512x512.png
```


### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```



### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
