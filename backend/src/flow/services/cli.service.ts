import { Injectable, NotFoundException } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { LogSource } from "@flowser/shared";
import { FlowConfigService } from "./config.service";
import { ProcessManagerService } from "../../processes/process-manager.service";

export type FlowCliKey = {
  derivationPath: string;
  mnemonic: string;
  private: string;
  public: string;
};

export type FlowCliVersion = {
  version: string;
};

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
    this.processManagerService.get(FlowCliService.processId)?.clearLogs();
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
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    await this.processManagerService.runUntilTermination(childProcess);
  }

  async generateKey(): Promise<FlowCliKey> {
    const childProcess = new ManagedProcessEntity({
      id: FlowCliService.processId,
      name: "Flow generate key",
      command: {
        name: "flow",
        args: ["keys", "generate", "--output", "json"],
        options: {
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    const output = await this.processManagerService.runUntilTermination(
      childProcess
    );
    const lineWithData = output.find(
      (outputLine) => outputLine.data.length > 0
    );
    return JSON.parse(lineWithData.data);
  }

  async getVersion(): Promise<FlowCliVersion> {
    const childProcess = new ManagedProcessEntity({
      id: "flow-version",
      name: "Flow version",
      command: {
        name: "flow",
        args: ["version"],
      },
    });
    const output = await this.processManagerService.runUntilTermination(
      childProcess
    );
    const stdout = output.filter(
      (log) => log.source === LogSource.LOG_SOURCE_STDOUT
    );
    const versionLog = stdout.find((log) => log.data.startsWith("Version"));
    // This should only happen with a test build,
    // but let's handle it anyway just in case
    const unknownVersionMessage = "Version information unknown!";
    if (versionLog.data === unknownVersionMessage) {
      throw new NotFoundException("Flow CLI version not found");
    }
    const [_, version] = versionLog?.data?.split(/: /) ?? [];
    return {
      version,
    };
  }
}
