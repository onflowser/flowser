import { Injectable } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";

@Injectable()
export class FlowDevWalletService implements ProjectContextLifecycle {
  static readonly processId = "dev-wallet";
  private projectContext: ProjectEntity;

  constructor(private readonly processManagerService: ProcessManagerService) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (this.projectContext.devWallet.run) {
      await this.start();
    }
  }

  async onExitProjectContext() {
    if (this.projectContext?.devWallet?.run) {
      await this.processManagerService.stop(FlowDevWalletService.processId);
      this.processManagerService
        .get(FlowDevWalletService.processId)
        ?.clearLogs();
    }
  }

  async start() {
    const devWalletProcess = new ManagedProcessEntity({
      id: FlowDevWalletService.processId,
      name: "Dev wallet",
      command: {
        name: "flow",
        args: [
          "dev-wallet",
          `--emulator-host=http://localhost:${this.projectContext.emulator.restServerPort}`,
          `--port=${this.projectContext.devWallet.port}`,
        ],
        options: {
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    await this.processManagerService.start(devWalletProcess);
  }
}
