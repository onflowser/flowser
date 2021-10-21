const { readFlowConfig, execute, TX_DIR_PATH } = require("./helpers");
const path = require("path");
const fs = require("fs/promises");

const [nodePath, execFile, accountName, contractName] = process.argv;


function transactionTemplate(accountAddress, contractName) {
  return `import ${contractName} from 0x${accountAddress}

transaction {

  prepare(acct: AuthAccount) {}

  execute {
    log(${contractName}.hello())
  }
}
`
}

(async function () {
  let flowConfig = await readFlowConfig();
  const account = flowConfig.accounts[accountName];
  if (!account) {
    throw new Error("Account not found in flow.json")
  }
  const name = contractName.replaceAll(/[ ]+/g, "");
  const filePath = path.join(TX_DIR_PATH, `${name}.cdc`)
  await fs.writeFile(filePath, transactionTemplate(account.address, name));
  const data = await execute("flow", ["transactions", "send", filePath], false)
  console.log(data)
})()
