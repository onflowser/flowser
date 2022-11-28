import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { LogSource } from "@flowser/shared";
import { FlowConfigService } from "./config.service";
import { ProcessManagerService } from "../../processes/process-manager.service";

@Injectable()
export class FlowCliService implements ProjectContextLifecycle {
  static readonly processId = "flow-init-config";
  private projectContext: ProjectEntity | undefined;

  constructor(
    private configService: FlowConfigService,
    private processManagerService: ProcessManagerService
  ) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (!this.configService.hasConfigFile()) {
      await this.initConfig();
      await this.configService.reload();
    }
  }

  async onExitProjectContext() {
    this.processManagerService
      .getByIdOrFail(FlowCliService.processId)
      ?.clearLogs();
    this.projectContext = undefined;
  }

  async initConfig() {
    const childProcess = new ManagedProcessEntity({
      id: FlowCliService.processId,
      name: "Flow init",
      command: {
        name: "flow",
        args: ["init"],
        options: {
          cwd: this.projectContext?.filesystemPath,
        },
      },
    });
    await this.processManagerService.runUntilTermination(childProcess);
  }

  async getInfo() {
    const childProcess = new ManagedProcessEntity({
      id: "flow-version",
      name: "Flow version",
      command: {
        name: "flow",
        args: ["version"],
      },
    });
    await childProcess.start();
    await childProcess.waitOnExit();
    const stdout = childProcess.logs.filter(
      (log) => log.source === LogSource.LOG_SOURCE_STDOUT
    );
    const versionLog = stdout.find((log) => log.data.startsWith("Version"));
    // This should only happen with a test build,
    // but let's handle it anyway just in case
    const unknownVersionMessage = "Version information unknown!";
    if (versionLog?.data === unknownVersionMessage) {
      throw new NotFoundException("Flow CLI version not found");
    }
    const [_, version] = versionLog?.data?.split(/: /) ?? [];
    return {
      version,
    };
  }
}
