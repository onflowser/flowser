const {spawn} = require("child_process")
const {mkdir} =  require("fs/promises")
const {join} = require("path");

const CONFIG_ROOT_DIR = '.'

// A simple emulator js bindings implemented in js
// TODO: refactor to TypeScript when adding to real codebase
class FlowEmulator {

  constructor ({ logLevel = 'debug', projectId = "default" } = {}) {
    this.logLevel = logLevel;
    this.projectId = projectId;
  }

  projectDir() {
    return join(CONFIG_ROOT_DIR, this.projectId);
  }

  async createConfig() {
    await mkdir(this.projectDir());
    const flowInit = spawn("flow", ['init'], { cwd: this.projectDir() });
    return new Promise(((resolve, reject) => {
      flowInit.on("close", (code) => code > 0 ? reject() : resolve())
      flowInit.on("error", error => reject(error))
    }))
  }

  start() {
    return spawn("flow", ['emulator'], {
      cwd: this.projectDir()
    })
  }

}

// EXAMPLE USAGE

(async function () {
  const emulator = new FlowEmulator();
  try {
    await emulator.createConfig();
  } catch (e) {
    console.error(`[Flowser] Failed to create flow config: ${e}`)
    process.exit(1);
  }
  console.info(`[Flowser] Flow config initialised in: ${emulator.projectDir()}`)

  const emulatorProcess = emulator.start();

  console.info(`[Flowser] Flow emulator process started`)

  emulatorProcess.stdout.on("data", data => {
    console.debug("[Flowser] emulator stdout: ", data.toString())
  })

  emulatorProcess.stderr.on("data", data => {
    console.debug("[Flowser] emulator stderr: ", data.toString())
  })

  emulatorProcess.on("close", code => {
    console.log("[Flowser] emulator exited with code: ", code)
  })

  emulatorProcess.on("error", error => {
    console.error(`[Flowser] emulator error: ${error}`)
  })
})()
