<div align="center">
	<br>
	<img alt="Flowser logo" src="./frontend/src/assets/images/long_logo.svg" width="300" height="200">
	<p>
		<b>Easily start you local Flow network & inspect the state.</b>
	</p>
	<br>
	<br>
</div>

Flowser is a convenient development tool for [Flow blockchain](https://www.onflow.org/). It does all the heavy work of managing the Flow emulator, inspecting the current blockchain state and interacting with the network for you!

You can find more information on our documentation website: [docs.flowser.dev](https://docs.flowser.dev).

For a quick walk-through of the tool itself, see [FlipFest video demo](https://www.youtube.com/watch?v=yMs5awvGnlY&t=417s) or our demo from [Flow Office Hours](https://www.youtube.com/watch?v=LSHwwX4yZJI&t=1496s).


## 👋 Get started

### 1. Clone flowser repository

```bash
git clone https://github.com/onflowser/flowser
```

### 2. Install dependencies

The following system dependencies are required:
- Node.js (tested on v14.19)
- Yarn (tested on v1.22)
- TypeScript compiler - [tsc](https://www.typescriptlang.org/) (tested on v4.7.4)
- Protocol Buffers compiler - [protoc](https://grpc.io/docs/protoc-installation/) (tested on v3.21)
- [flow-cli](https://docs.onflow.org/flow-cli/install/)

> If you're using [nvm](https://github.com/nvm-sh/nvm) for Node.js version management, then just run `nvm use` in project root.

After prerequisites are installed, you can run the following command to set up local environment:

```bash
yarn run bootstrap
```

> It's recommended that you don't use your global installation of @nestjs/cli, because that can cause some unexpected issues.

### 3. Start Flowser

### Website

```bash
yarn run start
```

### Desktop app

```bash
yarn run start:desktop
```

### 4. Open in browser

Flowser should automatically open in your default browser.

Good job, you can now start flowsing around the flow blockchain 🏄.

## 🤝 Contributing

For feature suggestions, check out our [issues](https://github.com/onflowser/flowser/issues/new) and [discussions](https://github.com/onflowser/flowser/discussions) pages.

If you want to contribute to Flowser, see our [Development Guide](https://docs.flowser.dev/resources/development).

## ✌️ Contributors

- [`jgololicic`](http://github.com/jgololicic)
- [`bartolomej`](http://github.com/bartolomej)
- [`monikaxh`](http://github.com/monikaxh)

## 🙌 Credits

- [@bluesign](https://github.com/bluesign) - provided a useful [script](https://gist.github.com/bluesign/df24b31a61bf4cd11f88efb6edd78925) for indexing flow emulator db
