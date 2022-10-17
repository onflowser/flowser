<div align="center">
	<img alt="Flowser banner" src="https://user-images.githubusercontent.com/36109955/196263054-b42ecb52-340f-4982-bd62-404acb161d71.gif" />
	<br />
	<br />
</div>

> **News:** Our app is currently in beta and we'd love to hear your feedback! Follow us on [Twitter](https://twitter.com/onflowser) or join our [Discord server](https://discord.gg/2Nx3s8yD) for updates and feedback.


Flowser is first-of-its-kind development tool for [Flow blockchain](https://www.onflow.org/). It does the heavy work of managing blockchain emulator, inspecting the current state, interacting with the network and much more!

## Key Features

- **Easy to use**: Simplifies your development workflow
- **Transparent development**: See the whole state of your local Flow blockchain in real-time
- **Snapshot management**: Create and checkout [blockchain state snapshots](https://github.com/onflow/flow-emulator#managing-emulator-state) - similar to how Git works
- **Development wallet**: Built in [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet) integration for easy blockchain interactions
- **Account storage inspection**: Visual [account storage](https://developers.flow.com/cadence/language/accounts#account-storage) inspection 

## Get started

To get started, just download the app for your platform using the links below!

<a href="https://github.com/onflowser/flowser/releases" target="_blank">
  <img width="180" alt="Download on Windows" src="https://user-images.githubusercontent.com/36109955/196265032-56e01fa3-8771-498c-a4db-bee16bdb08e8.png" />
  <img width="180" alt="Download on MacOS" src="https://user-images.githubusercontent.com/36109955/196265049-a214d01b-7c1f-4504-a12b-1ec03743869e.png" />
</a>

If you encounter any issues with the app, [open a new Github issue](https://github.com/onflowser/flowser/issues) or reach to us on [Discord](https://discord.gg/2Nx3s8yD)!

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
