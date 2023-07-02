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
import { ProjectEntity } from "../../projects/project.entity";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { FlowGatewayService } from "./gateway.service";
import { isDefined, waitForMs } from "../../utils/common-utils";
import { EventEmitter } from 'node:events';

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
  APIS_STARTED = "APIS_STARTED"
}

@Injectable()
export class FlowEmulatorService extends EventEmitter implements ProjectContextLifecycle {
  public static readonly processId = "emulator";
  private projectContext: ProjectEntity | undefined;
  private process: ManagedProcessEntity | undefined;

  constructor(private processManagerService: ProcessManagerService) {
    super();
  }

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
    if (!this.projectContext?.emulator) {
      throw new Error("Emulator settings not found on project context");
    }
    // When "simple-addresses" flag is provided,
    // a monotonic address generation mechanism is used:
    // https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/emulator/blockchain.go#L336-L342
    const useMonotonicAddresses =
      options?.overrideUseMonotonicAddresses ??
      this.projectContext.emulator.useSimpleAddresses;
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

  async start() {
    if (!this.projectContext) {
      throw new Error("Project context not found");
    }
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
    this.emit(FlowEmulatorEvent.APIS_STARTED)
  }

  public static getDefaultFlags(): Emulator {
    // Some default values vary from the ones used in Flow CLI.
    return {
      verboseLogging: true,
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

  private async waitUntilApisStarted() {
    // Wait until emulator process emits "Started <API-name>" logs.
    const hasStarted = () => {
      if (!this.process) {
        throw new Error("Process not found");
      }
      return this.process.output.some((output) =>
        output.data.includes("Started")
      );
    };
    while (!hasStarted()) {
      await waitForMs(100);
    }
  }

  private getAppliedFlags(): string[] {
    const { emulator } = this.projectContext ?? {};

    if (!emulator) {
      throw new Error("Emulator not found in project context");
    }

    const formatTokenSupply = (tokenSupply: number) => tokenSupply.toFixed(1);
    const flag = (name: string, userValue: any, defaultValue?: any) => {
      const value = userValue || defaultValue;
      return value ? `--${name}=${value}` : undefined;
    };

    // TODO: I think windows support for snapshots was fixed, so we can remove this check
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
    ].filter(isDefined);
  }
}
