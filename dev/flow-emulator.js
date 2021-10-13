const { spawn } = require("child_process")
const { mkdir, stat } = require("fs/promises")
const { join } = require("path");

const CONFIG_ROOT_DIR = '.'

// A simple emulator js bindings implemented in js
// TODO: refactor to TypeScript when adding to real codebase
class FlowEmulator {

  constructor ({
    verboseLogging = true,
    projectId = "default",
    rpcServerPort = 3569,
    httpServerPort = 8080,
    blockTime,
    persist = false
  } = {}) {
    this.verboseLogging = verboseLogging;
    this.projectId = projectId;
    this.httpServerPort = httpServerPort;
    this.rpcServerPort = rpcServerPort;
    this.blocktime = blockTime;
    this.persist = persist;
  }

  projectDir () {
    return join(CONFIG_ROOT_DIR, this.projectId);
  }

  databaseDir () {
    return join(this.projectDir(), "flowdb")
  }

  async projectDirExists (projectId = "default") {
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

  async init() {
    if (!(await this.projectDirExists())) {
      await mkdir(this.projectDir());
    }
  }

  flag (name, userValue, defaultValue) {
    const value = userValue || defaultValue;
    return value ? `--${name}=${value}` : undefined;
  }

  start (cb = () => null) {
    const emulatorProcess = spawn("flow", [
      'emulator',
      this.flag("dbpath", this.databaseDir()),
      this.flag("http-port", this.httpServerPort),
      this.flag("persist", this.persist),
      this.flag("port", this.rpcServerPort),
      this.flag("verbose", this.verboseLogging)
    ], {
      cwd: this.projectDir()
    })

    return new Promise(((resolve, reject) => {
      emulatorProcess.stdout.on("data", data => {
        const lines = data.toString().split("\n").filter(e => !!e)
        cb(null, lines)
      })

      emulatorProcess.stderr.on("data", data => {
        const error = data.toString();
        cb(error, null)
      })

      emulatorProcess.on("close", code => {
        console.log("[Flowser] emulator exited with code: ", code)
        resolve(code);
      })

      emulatorProcess.on("error", error => {
        cb(error, null)
        reject(error)
      })
    }))

  }

}

// EXAMPLE USAGE

(async function () {
  const emulator = new FlowEmulator();
  await emulator.init();

  await emulator.start((error, data) => {
    if (error) {
      console.log(`[Flower] Received an error from emulator: ${error}`)
    } else {
      console.log(`[Flower] Received ${data.length} line of data from emulator: `, data)
    }
  });
})()
