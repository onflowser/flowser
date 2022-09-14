import { Injectable } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { LogSource } from "@flowser/shared";

@Injectable()
export class FlowCliService implements ProjectContextLifecycle {
  private projectContext: ProjectEntity | undefined;

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
  }

  async onExitProjectContext() {
    this.projectContext = undefined;
  }

  async getInfo() {
    const childProcess = new ManagedProcessEntity({
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
    const [_, version] = versionLog?.data?.split(/: /) ?? [];
    return {
      version,
    };
  }
}
