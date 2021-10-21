const {readFlowConfig, updateFlowConfig, execute, randomString } = require("./helpers");

const [nodePath, execFile, nAccountsArg] = process.argv;

const nAccounts = parseInt(nAccountsArg) | 1;

(async function () {
  let flowConfig = await readFlowConfig();
  for (let i = 0; i < nAccounts; i++) {
    const account = await createAccount();
    flowConfig["accounts"][account.name] = {
      address: account.address,
      key: account.privateKey
    }
    console.log(account)
  }
  await updateFlowConfig(flowConfig)
})()

async function createAccount() {
  const [msg, privateKeyLine, publicKeyLine] = await execute("flow", "keys", "generate")
  const [
    txInfoLine,
    addressLine
  ] = await execute("flow", ["accounts", "create", "--key", publicKeyLine[1]]);
  return {
    name: randomString(),
    address: addressLine[1],
    privateKey: privateKeyLine[1],
    publicKey: publicKeyLine[1]
  }
}

