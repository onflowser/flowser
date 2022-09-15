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

> **News:** We are currently developing Flowser desktop app, as part of the [Flow developer grant #27](https://github.com/onflow/developer-grants/issues/27). Follow us on [Twitter](https://twitter.com/onflowser) or join our [Discord server](https://discord.gg/2Nx3s8yD) for more updates.


Flowser is a convenient development tool for [Flow blockchain](https://www.onflow.org/). It does all the heavy work of managing the Flow emulator, inspecting the current blockchain state and interacting with the network for you!

You can find more information on our documentation website: [docs.flowser.dev](https://docs.flowser.dev).

For a quick walk-through of the tool itself, see [FlipFest video demo](https://www.youtube.com/watch?v=yMs5awvGnlY&t=417s) or our demo from [Flow Office Hours](https://www.youtube.com/watch?v=LSHwwX4yZJI&t=1496s).


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

# or use npm if you have node already installed
npm run prod:start
```

If flowser started successfully, you should see the bellow output:
```
Creating frontend-prod ... done
Creating database      ... done
Creating backend-prod  ... done
Creating dev-wallet    ... done
```

If you encounter any issues during app build or container start, check out our [Troubleshooting Guide](https://docs.flowser.dev/resources/development/#troubleshooting).

### 4. Open in browser

After flowser had successfully started, you can open the app in your favourite browser at [http://localhost:6060](http://localhost:6060) 🥳.

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
