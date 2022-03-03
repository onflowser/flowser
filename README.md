<div align="center">
	<br>
	<img alt="Flowser logo" src="https://flowser.dev/images/logo.svg" width="150" height="150">
	<h1>Flowser</h1>
	<p>
		<b>Easily start you local Flow network & inspect the state.</b>
	</p>
	<br>
	<br>
</div>

Flowser is a convenient development tool for [Flow blockchain](https://www.onflow.org/). It does all the heavy work of managing the Flow emulator, inspecting the current blockchain state and interacting with the network for you!

See [features](#-features) and  [key concepts](#-key-concepts) sections for a more in-depth overview of Flowser's core concepts and components. 

For a quick walk-through of the tool itself, see [FlipFest video demo](https://www.youtube.com/watch?v=yMs5awvGnlY&t=417s) or our demo from [Flow Office Hours](https://www.youtube.com/watch?v=LSHwwX4yZJI&t=1496s).

## 📖 Contents

- [Get started](#-get-started)
- [Features](#-features)
- [Key Concepts](#-key-concepts)
- [Caveats](#-caveats)
- [Contributing](#-contributing)
- [Contributors](#-contributors)
- [Credits](#-credits)

## 👋 Get started

### 1. Clone flowser repository

```bash
git clone https://github.com/onflowser/flowser
```

### 2. Install dependencies

You need to have Docker and docker-compose installed on your system in order to run Flowser. 

See: [Docker installation instructions](https://www.docker.com/get-started)

### 3. Start Flowser

This command will start Flowser with default configuration (recommended).

```bash
bash run.sh start

# or use npm if you have node installed
npm run prod:start
```

If flowser started successfully, you should see the bellow output:
```
Creating frontend-prod ... done
Creating database      ... done
Creating backend-prod  ... done
Creating dev-wallet    ... done
```

If you encounter any issues during app build or container start, check out our [Troubleshooting Guide](DEVELOPMENT.md#-troubleshooting).

### 4. Open in browser

After flowser had successfully started, you can open the app in your favourite browser at [http://localhost:6060](http://localhost:6060) 🥳.

Good job, you can now start flowsing around the flow blockchain 🏄.

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
Flowser natively supports [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet) tool for developer convenience.
You can log in using a default service account and send arbitrary transaction directly within flowser UI.

### Rest API

Flowser backend exposes a Restfull API, which is defined in [`backend/openapi.json`](backend/openapi.json) file that conforms to [OpenAPI](https://www.openapis.org/) specification.

## 💡 Key Concepts

Flowser is a tool that in its core helps you with managing the flow emulator and inspecting the current blockchain state.

### Data sourcing

All the interaction between Flowser and Flow blockchain is handled by the [Flow client library (fcl)](https://docs.onflow.org/fcl/).

Fcl provides a single shared interface for interacting with any type of Flow blockchain network (testnet, mainnet, emulator,...). Because of that, Flowser has the ability to aggregate data from any Flow data source and currently supports Testnet and local Emulator blockchains.

> See the [architectural diagram](./DEVELOPMENT.md#-architecture) in development guides to learn more.

### Emulator management

User of Flowser doesn't need to know what the flow emulator is or that it even exists, because Flowser handles the creation and management of emulator networks by default.

If the user however does want to run and manage flow emulator by himself (from CLI), he/she has the option to do that. Note that this is not the preferred way to use Flowser, because of [this issue with fcl-dev-wallet](./README.md#fcl-dev-wallet-support).

### Development wallet

Usually, if you wanted an easy way to interact with the Flow emulator, you would need to run a separate [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet#start-the-dev-wallet) service manually.

Flowser provides integration with [Flow's development wallet](https://github.com/onflow/fcl-dev-wallet) out of the box. That way users can conveniently interact with the Flow blockchain without leaving Flowser.

## 🚧 Caveats

### fcl-dev-wallet support
Flowser currently supports [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet) integration only for "custom projects", where flow emulator is managed (started/stopped) by the flowser itself. 

We recommend that you do not run flow emulator by yourself and instead create a custom emulator configuration through the flowser app.

If you do want to run the emulator by yourself (from a shell with `flow emulator` command), please leave a comment or a "thumbs up" on [this issue](https://github.com/onflowser/flowser/issues/72).

## 🤝 Contributing

If you have a feature suggestion/request, first go look through the [existing issues](https://github.com/onflowser/flowser/issues) and if you can't find a related feature [create a new one](https://github.com/onflowser/flowser/issues/new).

See [Development Guides](DEVELOPMENT.md) for more info on setting up development environment, or [Architecture Overview](docs/ARCHITECTURE.md) for info about high level system architecture.

## ✌️ Contributors

- [`jgololicic`](http://github.com/jgololicic)
- [`bartolomej`](http://github.com/bartolomej)
- [`monikaxh`](http://github.com/monikaxh)

## 🙌 Credits

- [@bluesign](https://github.com/bluesign) - provided a useful [script](https://gist.github.com/bluesign/df24b31a61bf4cd11f88efb6edd78925) for indexing flow emulator db
