<div align="center">
	<img alt="Flowser logo" src="./assets/logo.png" width="150" height="150">
	<h1>Flowser</h1>
	<p>
		<b>Easily inspect and debug Flow blockchain ⛓</b>
	</p>
	<br>
	<br>
</div>

This is a convenient development tool for [Flow blockchain](https://www.onflow.org/), which starts and indexes flow emulator or testnet blockchains.

## ✨ Features

### Flow emulator
Configure and run managed [flow emulator](https://github.com/onflow/flow-emulator) projects or start your own emulator instance on localhost

### Inspect blockchain 
Flowser allows you to inspect the current state of the flow blockchain. 
Every new change is automatically detected and displayed in the UI. 
You can view & search thought the following objects:
- 📄  **logs** (only available for managed emulator projects)
- 👤  **accounts** 
  - transactions
  - contracts
  - keys
  - storage
- 📦  **blocks**
  - transactions
  - collections
- 💳  **transactions**
  - script
  - signatures
  - events
- 📝  **contracts**
  - code
- 📅  **events**
  - data

### Dev wallet
Flowser natively supports [dev-wallet](https://github.com/onflow/fcl-dev-wallet) tool for developer convenience. 
You can log in using a default service account and send arbitrary transaction directly within flowser UI.
  
### Rest API

Flowser backend exposes a Restfull API, which is defined in [`backend/openapi.json`](backend/openapi.json) file that conforms to [OpenApi](https://www.openapis.org/) specification.

Learn how to import flowser open api specification to:
- [Postman](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
- [Insomnia](https://docs.insomnia.rest/insomnia/import-export-data)

## 👋 Get started

### 1. Clone flowser repository

```bash
git clone https://github.com/bartolomej/flowser
```

### 2. Install dependencies

You need to install Docker & docker-compose in order to run this app. 
See: [Docker installation instructions](https://www.docker.com/get-started)

### 2. Start flowser

This command will start Flowser with default configuration (recommended).

```bash
npm run start:dev
```

## 💻 Contributing

If you have a feature suggestion/request, first go look through the [existing issues](https://github.com/bartolomej/flowser/issues) and if you can't find a related feature [create a new one](https://github.com/bartolomej/flowser/issues/new).

See [Development Guides](./DEVELOPMENT.md) for more info on setting up development environment, or [Architecture Overview](./ARCHITECTURE.md) for info about high level system architecture.

## 🛠️ Build with

- [Node.js](https://nodejs.org/) 
- [Nest.js](https://nestjs.com/)
- [React.js](https://reactjs.org/)
- [Docker](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/)
- [flow-cli](https://github.com/onflow/flow-cli)
- [flow-fcl](https://github.com/onflow/fcl-js)

## 🙌 Credits

- [@bluesign](https://github.com/bluesign) - provided a useful [script](https://gist.github.com/bluesign/df24b31a61bf4cd11f88efb6edd78925) for indexing flow emulator db
