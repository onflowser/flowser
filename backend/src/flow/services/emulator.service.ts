import { Injectable } from "@nestjs/common";
import { hashAlgorithmToJSON, signatureAlgorithmToJSON } from "@flowser/shared";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";

@Injectable()
export class FlowEmulatorService implements ProjectContextLifecycle {
  public static readonly processId = "emulator";
  private projectContext: ProjectEntity | undefined;

  constructor(private processManagerService: ProcessManagerService) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (this.projectContext.shouldRunEmulator()) {
      await this.start();
    }
  }

  async onExitProjectContext() {
    this.projectContext = undefined;
    await this.stop();
    this.processManagerService.get(FlowEmulatorService.processId)?.clearLogs();
  }

  async start() {
    const managedProcess = new ManagedProcessEntity({
      id: FlowEmulatorService.processId,
      name: "Flow emulator",
      command: {
        name: "flow",
        args: ["emulator", ...this.getFlags()],
        options: {
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    await this.processManagerService.start(managedProcess);
  }

  async stop() {
    await this.processManagerService.stop(FlowEmulatorService.processId);
  }

  private getFlags() {
    const { emulator } = this.projectContext ?? {};

    const formatTokenSupply = (tokenSupply: number) => tokenSupply.toFixed(1);
    const flag = (name: string, userValue: any, defaultValue?: any) => {
      const value = userValue || defaultValue;
      return value ? `--${name}=${value}` : undefined;
    };

    // keep those parameters up to date with the currently used flow-cli version
    // https://github.com/onflow/flow-emulator#configuration
    return [
      flag("port", emulator.grpcServerPort),
      flag("rest-port", emulator.restServerPort),
      flag("admin-port", emulator.adminServerPort),
      flag("verbose", emulator.verboseLogging),
      flag("log-format", emulator.logFormat),
      flag("block-time", emulator.blockTime),
      flag("contracts", emulator.withContracts),
      flag("service-priv-key", emulator.servicePrivateKey),
      flag(
        "service-sig-algo",
        signatureAlgorithmToJSON(emulator.serviceSignatureAlgorithm)
      ),
      flag(
        "service-hash-algo",
        hashAlgorithmToJSON(emulator.serviceHashAlgorithm)
      ),
      flag("init", emulator.performInit),
      flag("rest-debug", emulator.enableRestDebug),
      flag("grpc-debug", emulator.enableGrpcDebug),
      flag("persist", emulator.persist),
      flag("snapshot", emulator.snapshot),
      flag("dbpath", emulator.databasePath),
      flag("simple-addresses", emulator.useSimpleAddresses),
      flag("token-supply", formatTokenSupply(emulator.tokenSupply)),
      flag("transaction-expiry", emulator.transactionExpiry),
      flag("storage-limit", emulator.storageLimit),
      flag("storage-per-flow", emulator.storagePerFlow),
      flag("min-account-balance", emulator.minAccountBalance),
      flag("transaction-fees", emulator.transactionFees),
      flag("transaction-max-gas-limit", emulator.transactionMaxGasLimit),
      flag("script-gas-limit", emulator.scriptGasLimit),
    ].filter(Boolean);
  }
}
