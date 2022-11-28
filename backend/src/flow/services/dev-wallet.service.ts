import { Injectable } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { DevWallet, ServiceStatus } from "@flowser/shared";
import * as http from "http";
import { defaultRestServerPort } from "./emulator.service";

export const defaultDevWalletPort = 8701;

@Injectable()
export class FlowDevWalletService implements ProjectContextLifecycle {
  static readonly processId = "dev-wallet";
  private projectContext: ProjectEntity | undefined;

  constructor(private readonly processManagerService: ProcessManagerService) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    const walletApiStatus = await FlowDevWalletService.getApiStatus(
      this.projectContext.devWallet
    );
    if (walletApiStatus !== ServiceStatus.SERVICE_STATUS_ONLINE) {
      await this.start();
    }
  }

  async onExitProjectContext() {
    await this.processManagerService.removeById(FlowDevWalletService.processId);
    this.processManagerService
      .getByIdOrFail(FlowDevWalletService.processId)
      ?.clearLogs();
  }

  async start() {
    const devWalletProcess = new ManagedProcessEntity({
      id: FlowDevWalletService.processId,
      name: "Dev wallet",
      command: {
        name: "flow",
        args: [
          "dev-wallet",
          `--emulator-host=http://localhost:${
            this.projectContext?.emulator?.restServerPort ??
            defaultRestServerPort
          }`,
          `--port=${
            this.projectContext?.devWallet.port ?? defaultDevWalletPort
          }`,
        ],
        options: {
          cwd: this.projectContext?.filesystemPath,
        },
      },
    });
    await this.processManagerService.start(devWalletProcess);
  }

  static async getApiStatus(devWallet: DevWallet): Promise<ServiceStatus> {
    return new Promise((resolve) => {
      const req = http
        .get(
          {
            host: "localhost",
            path: "/api/",
            port: devWallet.port,
          },
          () => {
            req.end();
            return resolve(ServiceStatus.SERVICE_STATUS_ONLINE);
          }
        )
        .on("error", (err) => {
          req.end();
          return resolve(ServiceStatus.SERVICE_STATUS_OFFLINE);
        });
    });
  }
}
