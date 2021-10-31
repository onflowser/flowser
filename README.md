<div align="center">
	<img alt="Flowser logo" src="./assets/logo.png" width="150" height="150">
	<h1>Flowser</h1>
	<p>
		<b>Easily inspect and debug Flow blockchain ⛓</b>
	</p>
	<br>
	<br>
	<br>
</div>

This is a convenient development tool for Flow blockchain, which starts and indexes flow emulator or testnet blockchains.

## ✨ Features

### Flow emulator 🕹
Configure and run managed flow emulator projects or start your own emulator instance on localhost

### Inspect blockchain 🕵️
Flowser allows you to inspect the current state of the flow blockchain. 
Every new change is automatically detected and displayed in the UI. 
You can view & search thought the following objects:
- 📄**logs** (only available for managed emulator projects)
- 👤**accounts** 
  - transactions
  - contracts
  - keys
  - storage
- 📦**blocks**
  - transactions
  - collections
- 💳**transactions**
  - script
  - signatures
  - events
- 📝**contracts**
  - code
- 📅**events**
  - data

### Dev wallet 👛
Flowser natively supports dev-wallet tool for developer convenience. 
You can login using a default service account and send arbitrary transaction directly within flowser UI.
  
### Rest API 🌐

Flowser backend exposes a Restfull API, which is defined in [`backend/openapi.json`](backend/openapi.json) file that conforms to [OpenApi](https://www.openapis.org/) specification.

Learn how to import flowser open api specification to:
- [Postman](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
- [Insomnia](https://docs.insomnia.rest/insomnia/import-export-data)

## 👋 Get started

### Clone flowser repository

```bash
git clone https://github.com/bartolomej/flowser
```

### Start flowser

```bash
docker-compose up -d
```

## 💻 Contributing

If you have a feature suggestion/request, first go look through the [existing issues](https://github.com/bartolomej/flowser/issues) and if you can't find a related feature [create a new one](https://github.com/bartolomej/flowser/issues/new).

See [Development Guides](./DEVELOPMENT.md) for more info on setting up development environment. 

## 🛠️ Build with

- [Node.js](https://nodejs.org/) 
- [Nest.js](https://nestjs.com/)
- [React.js](https://reactjs.org/)
- [Docker](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/)
- [flow-cli](https://github.com/onflow/flow-cli)
- [flow-fcl](https://github.com/onflow/fcl-js)
