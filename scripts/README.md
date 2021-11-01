# Flowser helper kit

This is a collection of helper scripts, useful for generating test data for testing and debugging Flowser.

## Commands

### Init kit

You firstly need to initialise scripts
```shell
node scripts/init.js
```

### Add account
Generated accounts will be automatically added to `dev/flow.json` config file.

**Usage:**
```shell
node scripts/generate-account.js <number-of-accounts>
```

**Example:**
```shell
node scripts/send-transaction.js 2
```

### Deploy contract to account

**Usage:**
```shell
node scripts/add-contract.js <account-name> <contract-name>
```

**Example:**
```shell
node scripts/send-transaction.js emulator-account HelloWorld
```

### Send transaction

**Usage:**
```shell
node scripts/send-transaction.js <account-name> <contract-name>
```

**Example:**
```shell
node scripts/send-transaction.js emulator-account HelloWorld
```
