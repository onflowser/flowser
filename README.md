<div align="center">
	<br>
	<img alt="Flowser logo" src="./docs/images/logo.png" width="150" height="150">
	<h1>Flowser</h1>
	<p>
		<b>Easily inspect and debug Flow blockchain ⛓</b>
	</p>
	<br>
	<br>
</div>

This is a convenient development tool for [Flow blockchain](https://www.onflow.org/), which starts and indexes flow emulator or testnet blockchains.

Flowser is also available in hosted version (BETA) available at [app.flowser.dev](https://app.flowser.dev). You should only be use online version for demonstration purposes, as it currently supports only a single project at the time (not useful for parallel usage by many users).

## 📖 Contents

- [Key features](#-features)
- [Get started](#-get-started)
- [Contributing](#-contributing)
- [Build with](#%EF%B8%8F-build-with)
- [Contributors](#-contributors)
- [Credits](#-credits)

## ✨ Features

### Flow emulator
Configure and run managed [flow emulator](https://github.com/onflow/flow-emulator) projects or start your own emulator instance on localhost.

### Inspect blockchain 
Flowser allows you to inspect the current state of the flow blockchain. 
Every new change is automatically detected and displayed in the UI. 

You can view & search thought the following objects:
- **logs**
- **accounts** 
- **blocks**
- **transactions**
- **contracts**
- **events**

### Dev wallet
Flowser natively supports [dev-wallet](https://github.com/onflow/fcl-dev-wallet) tool for developer convenience. 
You can log in using a default service account and send arbitrary transaction directly within flowser UI.
  
### Rest API

Flowser backend exposes a Restfull API, which is defined in [`backend/openapi.json`](backend/openapi.json) file that conforms to [OpenApi](https://www.openapis.org/) specification.

Learn how to import flowser open api specification to:
- [Postman](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
- [Insomnia](https://docs.insomnia.rest/insomnia/import-export-data)

Check out [FEATURES.md](./docs/FEATURES.md) to get a complete list of features.

## 👋 Get started

### 1. Clone flowser repository

```bash
git clone https://github.com/bartolomej/flowser
```

### 2. Install dependencies

You need to install Docker & docker-compose in order to run this app. 
See: [Docker installation instructions](https://www.docker.com/get-started)

### 3. Start flowser

This command will start Flowser with default configuration (recommended).

```bash
bash start.sh

# or use npm if you have node installed
npm run prod:start
```

## 💻 Contributing

If you have a feature suggestion/request, first go look through the [existing issues](https://github.com/bartolomej/flowser/issues) and if you can't find a related feature [create a new one](https://github.com/bartolomej/flowser/issues/new).

See [Development Guides](docs/DEVELOPMENT.md) for more info on setting up development environment, or [Architecture Overview](docs/ARCHITECTURE.md) for info about high level system architecture.

## 🛠️ Build with

![](https://img.shields.io/badge/--333?logo=Node.js)
![](https://img.shields.io/badge/--ea2845?logo=Nestjs)
![](https://img.shields.io/badge/--282c34?logo=react)
![](https://img.shields.io/badge/--022044?logo=docker)
![](https://img.shields.io/badge/--42494f?logo=mongodb)

- [Node.js](https://nodejs.org/)
- [Nest.js](https://nestjs.com/)
- [React.js](https://reactjs.org/)
- [Docker](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/)
- [flow-cli](https://github.com/onflow/flow-cli)
- [flow-fcl](https://github.com/onflow/fcl-js)

## ✌️ Contributors

- [`jgololicic`](http://github.com/jgololicic)
- [`bartolomej`](http://github.com/bartolomej)
- [`monikaxh`](http://github.com/monikaxh)

## 🙌 Credits

- [@bluesign](https://github.com/bluesign) - provided a useful [script](https://gist.github.com/bluesign/df24b31a61bf4cd11f88efb6edd78925) for indexing flow emulator db
- [@wmnnd](https://github.com/wmnnd) - docker production setup [guide](https://github.com/wmnnd/nginx-certbot)
