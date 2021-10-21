const fs = require("fs/promises");

const { execute, TEMP_DIR_PATH, TX_DIR_PATH, CONTRACTS_DIR_PATH } = require("./helpers");

(async function () {
  await fs.mkdir(TEMP_DIR_PATH).catch(console.error);
  await fs.mkdir(TX_DIR_PATH).catch(console.error);
  await fs.mkdir(CONTRACTS_DIR_PATH).catch(console.error);
  await execute("flow", ["init"]);
})()
