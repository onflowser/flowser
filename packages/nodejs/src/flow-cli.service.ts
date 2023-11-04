import { ProcessOutputSource } from "./processes/managed-process";
import { ProcessManagerService } from "./processes/process-manager.service";
import { randomUUID } from "crypto";
import { HashAlgorithm, SignatureAlgorithm } from "@onflowser/api";

export type GeneratedKey = {
  derivationPath: string;
  mnemonic: string;
  private: string;
  public: string;
};

export type KeyWithWeight = {
  weight: number;
  publicKey: string;
};

export type CreatedAccount = {
  // Address, without '0x' prefix.
  address: string;
  balance: string;
  contracts: [];
  // Public keys that you provided as input.
  keys: string[];
};

type FlowCliVersion = {
  version: string;
};

type SimpleFlowCliFlag = string;
type KeyValueFlowCliFlag = {
  key: string;
  // Flags with undefined value will be excluded.
  value: string | number | undefined;
};
type FlowCliFlag = SimpleFlowCliFlag | KeyValueFlowCliFlag;

// Simplified options for basic usage.
type RunCliCommandOptions = {
  // Every command should have a unique human-readable name.
  name: string;
  // Should this command be run in the project folder.
  cwd?: string;
  flowFlags: FlowCliFlag[];
};

type InitOptions = {
  projectRootPath: string;
};

type GenerateKeyOptions = {
  derivationPath?: string;
  mnemonicSeed?: string;
  signatureAlgorithm?: SignatureAlgorithm;
  projectRootPath: string;
};

type CreateAccountOptions = {
  keys: KeyWithWeight[];
  // Account name from configuration used to sign the transaction (default "emulator-account")
  signer?: string;
  hashAlgorithm?: HashAlgorithm;
  signatureAlgorithm?: SignatureAlgorithm;
  projectRootPath: string;
};

export class FlowCliService {
  static readonly processId = "flow-init-config";

  constructor(private processManagerService: ProcessManagerService) {}

  async init(options: InitOptions) {
    const childProcess = this.processManagerService.initManagedProcess({
      id: FlowCliService.processId,
      name: "Flow init",
      command: {
        name: "flow",
        args: ["init"],
        options: {
          cwd: options.projectRootPath,
        },
      },
    });
    await this.processManagerService.runUntilTermination(childProcess);
  }

  async generateKey(options: GenerateKeyOptions): Promise<GeneratedKey> {
    return this.runAndGetJsonOutput<GeneratedKey>({
      name: "Flow generate key",
      flowFlags: [
        "keys",
        "generate",
        {
          key: "--derivationPath",
          value: options?.derivationPath,
        },
        {
          key: "--mnemonic",
          value: options?.mnemonicSeed,
        },
        {
          key: "--sig-algo",
          value: options?.signatureAlgorithm,
        },
      ],
      cwd: options.projectRootPath,
    });
  }

  async createAccount(options: CreateAccountOptions): Promise<CreatedAccount> {
    return this.runAndGetJsonOutput<CreatedAccount>({
      name: "Flow create account",
      flowFlags: [
        "accounts",
        "create",
        {
          key: "--signer",
          value: options.signer,
        },
        {
          key: "--hash-algo",
          value: options.hashAlgorithm,
        },
        {
          key: "--sig-algo",
          value: options?.signatureAlgorithm,
        },
        ...options.keys
          .map((key): FlowCliFlag[] => [
            { key: "--key", value: key.publicKey },
            { key: "--key-weight", value: key.weight },
          ])
          .flat(),
      ],
      cwd: options.projectRootPath,
    });
  }

  async getVersion(): Promise<FlowCliVersion> {
    const output = await this.runAndGetOutput({
      name: "Flow version",
      flowFlags: ["version"],
    });
    const stdout = output.filter(
      (log) => log.source === ProcessOutputSource.OUTPUT_SOURCE_STDOUT,
    );
    const versionLog = stdout.find((log) => log.data.startsWith("Version"));
    // This should only happen with a test build,
    // but let's handle it anyway just in case
    const unknownVersionMessage = "Version information unknown!";
    if (!versionLog || versionLog.data === unknownVersionMessage) {
      throw new Error("Flow CLI version not found");
    }
    const [_, version] = versionLog?.data?.split(/: /) ?? [];
    return {
      version,
    };
  }

  private async runAndGetJsonOutput<Output>(
    options: RunCliCommandOptions,
  ): Promise<Output> {
    const output = await this.runAndGetOutput({
      ...options,
      flowFlags: [...options.flowFlags, "--output", "json"],
    });
    const lineWithData = output.find(
      (outputLine) => outputLine.data.length > 0,
    );
    if (!lineWithData) {
      throw new Error("Output line with JSON data not found");
    }
    return JSON.parse(lineWithData.data) as Output;
  }

  private async runAndGetOutput(options: RunCliCommandOptions) {
    const childProcess = this.processManagerService.initManagedProcess({
      id: randomUUID(),
      name: options.name,
      command: {
        name: "flow",
        args: options.flowFlags.map((flag) => this.buildFlag(flag)).flat(),
        options: options.cwd ? { cwd: options.cwd } : undefined,
      },
    });
    return this.processManagerService.runUntilTermination(childProcess);
  }

  private buildFlag(flag: FlowCliFlag): string[] {
    if (typeof flag === "string") {
      return [flag];
    }

    if (flag.value !== undefined) {
      return [flag.key, String(flag.value)];
    }

    return [];
  }
}
