const {spawn} = require("child_process")
const {mkdir,stat} =  require("fs/promises")
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

  static async configExists(projectId = "default") {
    try {
      await stat(join(CONFIG_ROOT_DIR, projectId))
      return true;
    } catch (e) {
      if (e.code === "ENOENT") {
        return false;
      } else {
        throw e;
      }
    }
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
  if (!await FlowEmulator.configExists()) {
    try {
      await emulator.createConfig();
      console.info(`[Flowser] Flow config initialised in: ${emulator.projectDir()}`)
    } catch (e) {
      console.error(`[Flowser] Failed to create flow config: ${e}`)
      process.exit(1);
    }
  } else {
    console.info(`[Flowser] Config exists - skipping flow config initialisation.`)
  }

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
