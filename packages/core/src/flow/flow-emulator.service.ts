import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ProcessOutputSource } from "@flowser/shared";
import { ProcessManagerService } from "../processes/process-manager.service";
import { ManagedProcess } from "../processes/managed-process";
import {
  isDefined,
  waitForMs,
} from "../../../../backend/src/utils/common-utils";
import { EventEmitter } from "node:events";
import { HashAlgorithm, SignatureAlgorithm } from "@onflowser/api";

type FlowWellKnownAddresses = {
  serviceAccountAddress: string;
  flowTokenAddress: string;
  fungibleTokenAddress: string;
  flowFeesAddress: string;
};

export type WellKnownAddressesOptions = {
  // If not specifies, uses the setting from current emulator settings.
  overrideUseMonotonicAddresses?: boolean;
};

export enum FlowEmulatorEvent {
  APIS_STARTED = "APIS_STARTED",
}

export type FlowEmulatorConfig = {
  workingDirectoryPath: string;
  verboseLogging: boolean;
  logFormat: string;
  restServerPort: number;
  grpcServerPort: number;
  adminServerPort: number;
  blockTime: number;
  servicePrivateKey: string;
  databasePath: string;
  tokenSupply: number;
  transactionExpiry: number;
  storagePerFlow: number;
  minAccountBalance: number;
  transactionMaxGasLimit: number;
  scriptGasLimit: number;
  serviceSignatureAlgorithm: SignatureAlgorithm;
  serviceHashAlgorithm: HashAlgorithm;
  storageLimit: boolean;
  transactionFees: boolean;
  persist: boolean;
  withContracts: boolean;
  enableGrpcDebug: boolean;
  enableRestDebug: boolean;
  useSimpleAddresses: boolean;
  snapshot: boolean;
};

@Injectable()
export class FlowEmulatorService extends EventEmitter {
  public static readonly processId = "emulator";
  private process: ManagedProcess | undefined;
  private config: FlowEmulatorConfig;

  constructor(private processManagerService: ProcessManagerService) {
    super();
    this.config = this.getDefaultConfig();
  }

  async stopAndCleanup() {
    await this.processManagerService.remove(FlowEmulatorService.processId);
    this.processManagerService.get(FlowEmulatorService.processId)?.clearLogs();
  }

  /**
   * Well known addresses have predefined roles
   * and are used to deploy common/core flow contracts.
   *
   * For more info, see source code:
   * - https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/server/server.go#L163-L169
   * - https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/emulator/contracts.go#L17-L60
   */
  public getWellKnownAddresses(
    options?: WellKnownAddressesOptions
  ): FlowWellKnownAddresses {
    // When "simple-addresses" flag is provided,
    // a monotonic address generation mechanism is used:
    // https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/emulator/blockchain.go#L336-L342
    const useMonotonicAddresses =
      options?.overrideUseMonotonicAddresses ?? this.config.useSimpleAddresses;
    return {
      serviceAccountAddress: useMonotonicAddresses
        ? "0x0000000000000001"
        : "0xf8d6e0586b0a20c7",
      fungibleTokenAddress: useMonotonicAddresses
        ? "0x0000000000000002"
        : "0xee82856bf20e2aa6",
      flowTokenAddress: useMonotonicAddresses
        ? "0x0000000000000003"
        : "0x0ae53cb6e3f42a79",
      flowFeesAddress: useMonotonicAddresses
        ? "0x0000000000000004"
        : "0xe5a8b7f23e8b548f",
    };
  }

  async start(config: FlowEmulatorConfig) {
    this.process = new ManagedProcess({
      id: FlowEmulatorService.processId,
      name: "Flow emulator",
      command: {
        name: "flow",
        args: ["emulator", ...this.getProcessFlags(config)],
        options: {
          cwd: config.workingDirectoryPath,
        },
      },
    });
    await this.processManagerService.start(this.process);

    // Resolves if APIs started or throws an error otherwise
    await Promise.race([this.waitUntilApisStarted(), this.throwIfErrored()]);

    this.emit(FlowEmulatorEvent.APIS_STARTED);
  }

  public getDefaultConfig(): FlowEmulatorConfig {
    // Some default values vary from the ones used in Flow CLI.
    return {
      // TODO(restructure): Would it make sense to store dir path in a separate struct?
      workingDirectoryPath: "",
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
    const hasStarted = () => {
      if (!this.process) {
        throw new Error("Process not found");
      }
      return this.process.output.some(
        (output) =>
          output.source === ProcessOutputSource.OUTPUT_SOURCE_STDOUT &&
          output.data.includes("Started")
      );
    };
    while (!hasStarted()) {
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
          output.data !== ""
      );
    };
    let retries = 5;
    while (retries >= 0) {
      const error = getErrorOutput();
      if (error) {
        throw new InternalServerErrorException(
          "Emulator failed to start",
          error.data
        );
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
      flag("persist", config.persist),
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
