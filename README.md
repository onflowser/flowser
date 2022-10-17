<div align="center">
	<br>
	<img alt="Flowser logo" src="./frontend/src/assets/images/long_logo.svg" width="300" height="200">
	<p>
		<b>Supercharged development on Flow blockchain 🏄‍♂️ ⚡</b>
	</p>
	<br>
	<br>
</div>

> **News:** We are currently developing Flowser desktop app, as part of the [Flow developer grant #27](https://github.com/onflow/developer-grants/issues/27). Follow us on [Twitter](https://twitter.com/onflowser) or join our [Discord server](https://discord.gg/2Nx3s8yD) for more updates.


Flowser is a convenient development tool for [Flow blockchain](https://www.onflow.org/). It does all the heavy work of managing the Flow emulator, inspecting the current blockchain state and interacting with the network for you!

## Key Features

- **Easy to use**: Simplifies your development workflow
- **Transparent development**: See the whole state of your local Flow blockchain in real-time
- **Snapshot management**: Create and checkout [blockchain state snapshots](https://github.com/onflow/flow-emulator#managing-emulator-state) - similar to how Git works
- **Development wallet**: Built in [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet) integration for easy blockchain interactions
- **Account storage inspection**: Visual [account storage](https://developers.flow.com/cadence/language/accounts#account-storage) inspection 

## Development

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

#### As website

This is the recommended way for quick prototyping purposes, because it's faster.

Note that if you use this command, the app won't be run in the Electron environment, so it's always recommended to also test it with as a desktop app too.

```bash
yarn run start
```

#### As desktop app

```bash
yarn run start:desktop
```

## License

Flowser is [MIT licensed](./LICENSE).
