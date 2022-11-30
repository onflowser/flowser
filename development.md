## Development Guide

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
