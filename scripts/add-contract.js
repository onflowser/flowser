const path = require("path");
const fs = require("fs/promises");
const {readFlowConfig, execute, CONTRACTS_DIR_PATH } = require("./helpers");

const [nodePath, execFile, accountName, contractName, ...flags] = process.argv;

function contractTemplate(name = "HelloWorld") {
  // language=Cadence
  return `pub contract ${name} {
    pub let greeting: String
    pub event Greet(x: String)
    init() {
        self.greeting = "${name}"
    }
    pub fun hello(): String {
        emit Greet(x: self.greeting)
        return self.greeting
    }
}`
}

(async function () {
  let flowConfig = await readFlowConfig();
  if (!flowConfig.accounts[accountName]) {
    throw new Error("Account not found in flow.json")
  }
  const name = contractName.replaceAll(/[ ]+/g, "");
  const filePath = path.join(CONTRACTS_DIR_PATH, `${name}.cdc`)
  await fs.writeFile(filePath, contractTemplate(name));
  const data = await execute("flow", ["accounts", "add-contract", name, filePath, "--signer", accountName], false)
  console.log(data)
})()
