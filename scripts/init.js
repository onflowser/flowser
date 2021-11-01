const fs = require("fs/promises");

const { execute, TEMP_DIR_PATH, TX_DIR_PATH, CONTRACTS_DIR_PATH } = require("./helpers");

(async function () {
  await fs.mkdir(TEMP_DIR_PATH).catch(handleError);
  await fs.mkdir(TX_DIR_PATH).catch(handleError);
  await fs.mkdir(CONTRACTS_DIR_PATH).catch(handleError);
  await execute("flow", ["init"]);
})()

function handleError(e) {
  if (e.code === "EEXIST") {
    console.log(`Dir ${e.path} already exists. Skipping creation ...`)
  } else {
    console.log(e);
    process.exit(1);
  }
}
