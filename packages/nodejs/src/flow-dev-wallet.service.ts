import { ManagedProcess } from "./processes/managed-process";
import { IFlowserLogger, isDefined } from "@onflowser/core";
import { ProcessManagerService } from "./processes/process-manager.service";
import { HttpService } from "@onflowser/core/src/http.service";

export type FlowDevWalletConfig = {
  accessNodeRestApiUrl: string;
  workspacePath: string;
  port: number;
}

export class FlowDevWalletService {
  static readonly processId = "dev-wallet";

  constructor(
    private readonly logger: IFlowserLogger,
    private readonly httpService: HttpService,
    private readonly processManagerService: ProcessManagerService
  ) {}

  async start(config: FlowDevWalletConfig) {
    const flag = (name: string, value: any) => {
      return value ? `--${name}=${value}` : undefined;
    };

    const devWalletProcess = new ManagedProcess(this.logger, {
      id: FlowDevWalletService.processId,
      name: "Dev wallet",
      command: {
        name: "flow",
        args: [
          "dev-wallet",
          flag("emulator-host", config.accessNodeRestApiUrl),
          flag("port", config.port)
        ].filter(isDefined),
        options: {
          cwd: config.workspacePath,
        },
      },
    });
    await this.processManagerService.start(devWalletProcess);
  }

  async stop() {
    await this.processManagerService.remove(FlowDevWalletService.processId);
  }

  async isReachable(config: FlowDevWalletConfig): Promise<boolean> {
    return this.httpService.isReachable(`http://localhost:${config.port}`);
  }

}
