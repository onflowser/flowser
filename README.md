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

You can find more information on our documentation website: [docs.flowser.dev](https://docs.flowser.dev).

For a quick walk-through of the tool itself, see [FlipFest video demo](https://www.youtube.com/watch?v=yMs5awvGnlY&t=417s) or our demo from [Flow Office Hours](https://www.youtube.com/watch?v=LSHwwX4yZJI&t=1496s).


## 👋 Get started

### 1. Clone flowser repository

```bash
git clone https://github.com/onflowser/flowser
```

### 2. Install dependencies

The following system dependencies are required:
- Node.js (tested on v14.19.1)
- npm
- [flow-cli](https://docs.onflow.org/flow-cli/install/) (works with < v0.28.3)

After prerequisites are installed, you can run the following command to set up local environment:

```bash
npm run bootstrap
```

### 3. Start Flowser

The following command will start Flowser along with Flow emulator and development wallet.
```bash
npm start
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
