import { join } from "path";
import { mkdir, stat } from "fs/promises";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable } from "@nestjs/common";
import config from "../../config";
import { Project } from "../../projects/entities/project.entity";
import { EmulatorConfigurationEntity } from "../../projects/entities/emulator-configuration.entity";

type StartCallback = (error: Error, data: string) => void;

@Injectable()
export class FlowEmulatorService {

  private projectId: string;
  private configuration: EmulatorConfigurationEntity;
  private emulatorProcess: ChildProcessWithoutNullStreams;

  configureProjectContext(project: Project) {
    this.projectId = project.id;
    this.configuration = project.emulator;
  }

  projectDir () {
    return join(config.cacheRootDir, this.projectId);
  }

  databaseDir () {
    return join(this.projectDir(), "flowdb")
  }

  async projectDirExists () {
    try {
      await stat(this.projectDir())
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
    console.log(`[Flowser] initialising emulator for project: ${this.projectId}`)
    if (!(await this.projectDirExists())) {
      await mkdir(this.projectDir());
      console.log(`[Flowser] created project dir under ${this.projectDir()}`)
    }
  }

  private static flag (name: string, userValue: any, defaultValue?: any) {
    const value = userValue || defaultValue;
    return value ? `--${name}=${value}` : undefined;
  }

  isRunning() {
    return this.emulatorProcess && !this.emulatorProcess.killed;
  }

  start (cb: StartCallback = () => null) {
    const flags = [
      FlowEmulatorService.flag("dbpath", this.databaseDir()),
      FlowEmulatorService.flag("http-port", this.configuration.httpServerPort),
      FlowEmulatorService.flag("persist", this.configuration.persist),
      FlowEmulatorService.flag("port", this.configuration.rpcServerPort),
      FlowEmulatorService.flag("verbose", this.configuration.verboseLogging)
    ].filter(Boolean);

    console.log(`[Flowser] starting the emulator with flags: `, flags.join(" "))

    this.emulatorProcess = spawn("flow", [
      'emulator',
      ...flags
    ], {
      cwd: this.projectDir()
    })

    return new Promise(((resolve, reject) => {
      this.emulatorProcess.stdout.on("data", data => {
        const lines = data.toString().split("\n").filter(e => !!e)
        cb(null, lines)
      })

      this.emulatorProcess.stderr.on("data", data => {
        const error = data.toString();
        cb(error, null)
      })

      this.emulatorProcess.on("close", code => {
        console.log("[Flowser] emulator exited with code: ", code)
        resolve(code);
      })

      this.emulatorProcess.on("error", error => {
        cb(error, null)
        reject(error)
      })
    }))
  }

  stop() {
    console.log(`[Flowser] stopping emulator process: ${this.emulatorProcess.pid}`)
    if (this.isRunning()) {
      this.emulatorProcess.kill();
    }
  }

}
