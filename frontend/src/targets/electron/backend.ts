import path from "path";
import {
  createApp,
  ProcessManagerService,
  ProjectsService,
  ProjectEntity,
} from "@flowser/backend";
import { INestApplication } from "@nestjs/common";
import { Logger } from "./services/logger.service";
import crypto from "crypto";

export class FlowserBackend {
  private static instance: FlowserBackend;
  public app: INestApplication | undefined;

  public static getInstance(): FlowserBackend {
    if (!this.instance) {
      this.instance = new FlowserBackend();
    }
    return this.instance;
  }

  public async start(options: { userDataPath: string }): Promise<void> {
    const databaseFilePath = path.join(options.userDataPath, "flowser.sqlite");
    if (this.app) {
      await this.app.close();
    }
    this.app = await createApp({
      config: {
        database: {
          type: "sqlite",
          name: databaseFilePath,
        },
        common: {
          httpServerPort: 6061,
        },
      },
      nest: {
        logger: new Logger(),
      },
    });
  }

  public isCleanupComplete(): boolean {
    const processManagerService = this.app?.get(ProcessManagerService);
    return processManagerService?.isStoppedAll() ?? true;
  }

  public async cleanupAndStop(): Promise<void> {
    const processManagerService = this.app?.get(ProcessManagerService);
    // Make sure to stop all child processes, so that they don't become orphans
    await processManagerService?.stopAll();
    // Bellow promise is taking a really long time to resolve
    // so just don't await it for the time being
    // TODO: Investigate why is the Nest shutdown taking a long time
    this.app?.close();
  }

  public async startTemporaryProject(options: {
    filesystemPath: string;
  }): Promise<ProjectEntity> {
    const projectService = this.app?.get(ProjectsService);
    if (!projectService) {
      throw new Error("App not initialized");
    }

    const defaultProjectProto = projectService.getDefaultProject();

    const temporaryProject = ProjectEntity.create({
      id: crypto.randomBytes(20).toString("base64url"),
      name: "Flow CLI project",
      filesystemPath: options.filesystemPath,
      gateway: defaultProjectProto.gateway,
      emulator: defaultProjectProto.emulator,
      startBlockHeight: 0,
    });

    return projectService.useProject(temporaryProject);
  }
}
