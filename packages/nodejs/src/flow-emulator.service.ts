import { ManagedProcess } from "./processes/managed-process";
import {
  FlowApiStatus,
  FlowGatewayService,
  isDefined,
  waitForMs,
} from "@onflowser/core";
import { EventEmitter } from "node:events";
import {
  FlowEmulatorConfig,
  HashAlgorithm,
  ProcessOutputSource,
  SignatureAlgorithm,
} from "@onflowser/api";
import { ProcessManagerService } from "./processes/process-manager.service";

type StartEmulatorRequest = {
  workspacePath: string;
  config: FlowEmulatorConfig;
};

export class FlowEmulatorService extends EventEmitter {
  public static readonly processId = "emulator";
  private process: ManagedProcess | undefined;
  private activeConfig: FlowEmulatorConfig | undefined;

  constructor(
    private processManagerService: ProcessManagerService,
    private flowGatewayService: FlowGatewayService,
  ) {
    super();
  }

  async stopAndCleanup() {
    await this.processManagerService.remove(FlowEmulatorService.processId);
    this.processManagerService.get(FlowEmulatorService.processId)?.clearLogs();
  }

  async start(request: StartEmulatorRequest) {
    this.activeConfig = request.config;

    this.process = this.processManagerService.initManagedProcess({
      id: FlowEmulatorService.processId,
      name: "Flow emulator",
      command: {
        name: "flow",
        args: ["emulator", ...this.getProcessFlags(request.config)],
        options: {
          cwd: request.workspacePath,
        },
      },
    });
    await this.processManagerService.start(this.process);

    // Resolves if APIs started or throws an error otherwise
    await Promise.race([this.waitUntilApisStarted(), this.throwIfErrored()]);
  }

  public getDefaultConfig(): FlowEmulatorConfig {
    // Some default values vary from the ones used in Flow CLI.
    return {
      verboseLogging: false,
      enableRestDebug: false,
      restServerPort: 8888,
      enableGrpcDebug: false,
      grpcServerPort: 3569,
      adminServerPort: 8080,
      persist: false,
      snapshot: true,
      withContracts: true,
      blockTime: 0,
      servicePrivateKey: "",
      databasePath: "./flowdb",
      tokenSupply: 1000000000,
      transactionExpiry: 10,
      storagePerFlow: 100,
      minAccountBalance: 0,
      transactionMaxGasLimit: 9999,
      scriptGasLimit: 100000,
      serviceSignatureAlgorithm: SignatureAlgorithm.ECDSA_P256,
      serviceHashAlgorithm: HashAlgorithm.SHA3_256,
      storageLimit: true,
      transactionFees: false,
      useSimpleAddresses: false,
      logFormat: "text",
    };
  }

  // Resolves once emulator process emits "Started <API-name>" logs.
  private async waitUntilApisStarted() {
    const hasStarted = async () => {
      if (!this.activeConfig) {
        throw new Error("No active config found");
      }
      const apiStatuses = await Promise.all([
        this.flowGatewayService.getApiStatus(
          `http://localhost:${this.activeConfig.restServerPort}`,
        ),
        this.flowGatewayService.getApiStatus(
          `http://localhost:${this.activeConfig.adminServerPort}`,
        ),
      ]);

      return apiStatuses.every(
        (status) => status === FlowApiStatus.SERVICE_STATUS_ONLINE,
      );
    };
    while (!(await hasStarted())) {
      await waitForMs(100);
    }
  }

  private async throwIfErrored() {
    const getErrorOutput = () => {
      if (!this.process) {
        throw new Error("Process not found");
      }
      return this.process.output.find(
        (output) =>
          output.source === ProcessOutputSource.OUTPUT_SOURCE_STDERR &&
          output.data !== "",
      );
    };
    let retries = 5;
    while (retries >= 0) {
      const error = getErrorOutput();
      if (error) {
        throw new Error("Emulator failed to start: " + error.data);
      }
      await waitForMs(100);
      retries--;
    }
  }

  private getProcessFlags(config: FlowEmulatorConfig): string[] {
    const toFixedPoint = (tokenSupply: number) => tokenSupply.toFixed(1);
    const flag = (name: string, userValue: any, defaultValue?: any) => {
      const value = userValue || defaultValue;
      return value ? `--${name}=${value}` : undefined;
    };

    // keep those parameters up to date with the currently used flow-cli version
    // https://github.com/onflow/flow-emulator#configuration
    return [
      flag("port", config.grpcServerPort),
      flag("rest-port", config.restServerPort),
      flag("admin-port", config.adminServerPort),
      flag("verbose", config.verboseLogging),
      flag("log-format", config.logFormat),
      flag("block-time", config.blockTime),
      flag("contracts", config.withContracts),
      flag("service-priv-key", config.servicePrivateKey),
      flag("service-sig-algo", config.serviceSignatureAlgorithm),
      flag("service-hash-algo", config.serviceHashAlgorithm),
      flag("rest-debug", config.enableRestDebug),
      flag("grpc-debug", config.enableGrpcDebug),
      // Automatically enable persistence when snapshot option is used.
      // Only required until below flow-emulator issue is resolved:
      // https://github.com/onflow/flow-emulator/issues/490
      flag("persist", config.persist || config.snapshot),
      flag("snapshot", config.snapshot),
      flag("dbpath", config.databasePath),
      flag("simple-addresses", config.useSimpleAddresses),
      flag("token-supply", toFixedPoint(config.tokenSupply)),
      flag("transaction-expiry", config.transactionExpiry),
      flag("storage-limit", config.storageLimit),
      flag("storage-per-flow", toFixedPoint(config.storagePerFlow)),
      flag("min-account-balance", config.minAccountBalance),
      flag("transaction-fees", config.transactionFees),
      flag("transaction-max-gas-limit", config.transactionMaxGasLimit),
      flag("script-gas-limit", config.scriptGasLimit),
    ].filter(isDefined);
  }
}
