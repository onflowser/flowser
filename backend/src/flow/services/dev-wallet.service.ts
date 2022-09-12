import { Injectable } from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcess } from "../../processes/managed-process";

@Injectable()
export class FlowDevWalletService implements ProjectContextLifecycle {
  private readonly processId = "dev-wallet";
  private projectContext: ProjectEntity;

  constructor(private readonly processManagerService: ProcessManagerService) {}

  async onEnterProjectContext(project: ProjectEntity): Promise<void> {
    this.projectContext = project;
    if (this.projectContext.devWallet.run) {
      await this.start();
    }
  }

  async onExitProjectContext(): Promise<void> {
    if (this.projectContext.devWallet.run) {
      await this.processManagerService.stop(this.processId);
    }
  }

  async start() {
    // TODO(milestone-3): only start if not yet running on known port (e.g. by user)
    const devWalletProcess = new ManagedProcess({
      id: this.processId,
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
    await this.processManagerService.run(devWalletProcess);
  }
}
