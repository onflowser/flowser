# Flowser testing kit

## Commands

### Init kit

You firstly need to initialise testing kit:
```shell
node testing-kit/init.js
```

### Add account
Generated accounts will be automatically added to `dev/flow.json` config file.

**Usage:**
```shell
node testing-kit/generate-account.js <number-of-accounts>
```

**Example:**
```shell
node testing-kit/send-transaction.js 2
```

### Deploy contract to account

**Usage:**
```shell
node testing-kit/add-contract.js <account-name> <contract-name>
```

**Example:**
```shell
node testing-kit/send-transaction.js emulator-account HelloWorld
```

### Send transaction

**Usage:**
```shell
node testing-kit/send-transaction.js <account-name> <contract-name>
```

**Example:**
```shell
node testing-kit/send-transaction.js emulator-account HelloWorld
```
