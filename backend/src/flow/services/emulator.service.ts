import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  ServiceStatus,
  hashAlgorithmToJSON,
  signatureAlgorithmToJSON,
  Emulator,
  SignatureAlgorithm,
  HashAlgorithm,
} from "@flowser/shared";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { FlowGatewayService } from "./gateway.service";
import { waitForMs } from "../../utils";

@Injectable()
export class FlowEmulatorService implements ProjectContextLifecycle {
  public static readonly processId = "emulator";
  private projectContext: ProjectEntity | undefined;
  private process: ManagedProcessEntity | undefined;

  constructor(private processManagerService: ProcessManagerService) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    const accessNodeStatus = await FlowGatewayService.getApiStatus(
      this.projectContext.gateway
    );
    if (accessNodeStatus !== ServiceStatus.SERVICE_STATUS_ONLINE) {
      await this.start();
    }
  }

  async onExitProjectContext() {
    this.projectContext = undefined;
    await this.processManagerService.remove(FlowEmulatorService.processId);
    this.processManagerService.get(FlowEmulatorService.processId)?.clearLogs();
  }

  async start() {
    this.process = new ManagedProcessEntity({
      id: FlowEmulatorService.processId,
      name: "Flow emulator",
      command: {
        name: "flow",
        args: ["emulator", ...this.getAppliedFlags()],
        options: {
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    await this.processManagerService.start(this.process);
    await this.waitUntilApisStarted();
  }

  public static getDefaultFlags(): Emulator {
    return Emulator.fromPartial({
      verboseLogging: true,
      restServerPort: 8888,
      grpcServerPort: 3569,
      adminServerPort: 8080,
      persist: false,
      snapshot: true,
      withContracts: false,
      blockTime: 0,
      servicePrivateKey: undefined,
      databasePath: "./flowdb",
      tokenSupply: 1000000000,
      transactionExpiry: 10,
      storagePerFlow: undefined,
      minAccountBalance: undefined,
      transactionMaxGasLimit: 9999,
      scriptGasLimit: 100000,
      serviceSignatureAlgorithm: SignatureAlgorithm.ECDSA_P256,
      serviceHashAlgorithm: HashAlgorithm.SHA3_256,
      storageLimit: true,
      transactionFees: false,
      simpleAddresses: false,
    });
  }

  private async waitUntilApisStarted() {
    // Wait until emulator process emits "Started <API-name>" logs.
    const hasStarted = () =>
      this.process.output.some((output) => output.data.includes("Started"));
    while (!hasStarted()) {
      await waitForMs(100);
    }
  }

  private getAppliedFlags(): string[] {
    const { emulator } = this.projectContext ?? {};

    const formatTokenSupply = (tokenSupply: number) => tokenSupply.toFixed(1);
    const flag = (name: string, userValue: any, defaultValue?: any) => {
      const value = userValue || defaultValue;
      return value ? `--${name}=${value}` : undefined;
    };

    const isWindows = process.platform === "win32";
    const isSnapshotFeatureDisabled = emulator.snapshot && isWindows;
    if (isSnapshotFeatureDisabled) {
      throw new InternalServerErrorException(
        "Snapshot emulator flag is not yet supported on windows, " +
          "see https://github.com/onflow/flow-emulator/issues/208"
      );
    }

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
