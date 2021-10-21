const path = require("path");
const fs = require("fs");
const {spawn} = require("child_process");

const ROOT_DIR_PATH = path.join(__dirname, "..")
const FLOW_CONFIG_PATH = path.join(ROOT_DIR_PATH, "flow.json");
const TEMP_DIR_PATH = path.join(ROOT_DIR_PATH, ".temp")
const TX_DIR_PATH = path.join(TEMP_DIR_PATH, "transactions")
const CONTRACTS_DIR_PATH = path.join(TEMP_DIR_PATH, "contracts")


function readFlowConfig() {
  return new Promise((resolve, reject) =>
    fs.readFile(FLOW_CONFIG_PATH, (error, data) =>
      error ? reject(error) : resolve(JSON.parse(data.toString())))
  )
}

function updateFlowConfig(data) {
  return new Promise((resolve, reject) =>
    fs.writeFile(FLOW_CONFIG_PATH, JSON.stringify(data, null, 4), error =>
      error ? reject(error) : resolve())
  )
}

function execute(bin = "", args, parseOutput = true) {
  if (!bin) {
    throw new Error("Provide a command");
  }
  console.log("executing: ", [bin, ...args].join(" "));
  return new Promise(((resolve, reject) => {
    let out = "";
    const process = spawn(bin, args, {
      cwd: ROOT_DIR_PATH
    });

    process.stdout.on("data", data => {
      out += data.toString();
    })

    process.stderr.on("data", data => {
      out += data.toString();
    })

    process.on("exit", (code) => code === 0
      ? resolve(parseOutput ? out.split("\n").map(parseLine).filter(Boolean) : out)
      : reject(out)
    );
  }))
}

function randomString() {
  return `${Math.round(Math.random() * 10000000000)}`
}

function parseLine(line) {
  const value = line.trim();
  if (/\t/.test(value)) {
    return value.split(/[ ]*\t[ ]*/);
  } else {
    return value;
  }
}

module.exports = {
  readFlowConfig,
  updateFlowConfig,
  execute,
  randomString,
  FLOW_CONFIG_PATH,
  TEMP_DIR_PATH,
  TX_DIR_PATH,
  CONTRACTS_DIR_PATH
}
