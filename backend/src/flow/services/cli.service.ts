import {
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from "@nestjs/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/project.entity";
import { ManagedProcessEntity } from "../../processes/managed-process.entity";
import { ProcessOutputSource } from "@flowser/shared";
import { FlowConfigService } from "./config.service";
import { ProcessManagerService } from "../../processes/process-manager.service";
import {
  HashAlgorithm,
  hashAlgorithmToJSON,
  SignatureAlgorithm,
  signatureAlgorithmToJSON,
} from "@flowser/shared/dist/src/generated/entities/common";

export type GenerateKeyOptions = {
  derivationPath?: string;
  mnemonicSeed?: string;
  signatureAlgorithm?: SignatureAlgorithm;
};

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

type CreateAccountOptions = {
  keys: KeyWithWeight[];
  // Account name from configuration used to sign the transaction (default "emulator-account")
  signer?: string;
  hashAlgorithm?: HashAlgorithm;
  signatureAlgorithm?: SignatureAlgorithm;
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
  useProjectAsCwd: boolean;
  flowFlags: FlowCliFlag[];
};

@Injectable()
export class FlowCliService implements ProjectContextLifecycle {
  static readonly processId = "flow-init-config";
  private projectContext: ProjectEntity | undefined;

  constructor(
    private configService: FlowConfigService,
    private processManagerService: ProcessManagerService
  ) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (!this.configService.hasConfigFile()) {
      await this.initConfig();
      await this.configService.reload();
    }
  }

  async onExitProjectContext() {
    this.processManagerService.get(FlowCliService.processId)?.clearLogs();
    this.projectContext = undefined;
  }

  async initConfig() {
    const childProcess = new ManagedProcessEntity({
      id: FlowCliService.processId,
      name: "Flow init",
      command: {
        name: "flow",
        args: ["init"],
        options: {
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    await this.processManagerService.runUntilTermination(childProcess);
  }

  async generateKey(options?: GenerateKeyOptions): Promise<GeneratedKey> {
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
          value: options?.signatureAlgorithm
            ? signatureAlgorithmToJSON(options?.signatureAlgorithm)
            : undefined,
        },
      ],
      useProjectAsCwd: true,
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
          value: options.hashAlgorithm
            ? hashAlgorithmToJSON(options.hashAlgorithm)
            : undefined,
        },
        {
          key: "--sig-algo",
          value: options?.signatureAlgorithm
            ? signatureAlgorithmToJSON(options?.signatureAlgorithm)
            : undefined,
        },
        ...options.keys
          .map((key): FlowCliFlag[] => [
            { key: "--key", value: key.publicKey },
            { key: "--key-weight", value: key.weight },
          ])
          .flat(),
      ],
      useProjectAsCwd: true,
    });
  }

  async getVersion(): Promise<FlowCliVersion> {
    const output = await this.runAndGetOutput({
      name: "Flow version",
      flowFlags: ["version"],
      useProjectAsCwd: false,
    });
    const stdout = output.filter(
      (log) => log.source === ProcessOutputSource.OUTPUT_SOURCE_STDOUT
    );
    const versionLog = stdout.find((log) => log.data.startsWith("Version"));
    // This should only happen with a test build,
    // but let's handle it anyway just in case
    const unknownVersionMessage = "Version information unknown!";
    if (versionLog.data === unknownVersionMessage) {
      throw new NotFoundException("Flow CLI version not found");
    }
    const [_, version] = versionLog?.data?.split(/: /) ?? [];
    return {
      version,
    };
  }

  private async runAndGetJsonOutput<Output>(
    options: RunCliCommandOptions
  ): Promise<Output> {
    const output = await this.runAndGetOutput({
      ...options,
      flowFlags: [...options.flowFlags, "--output", "json"],
    });
    const lineWithData = output.find(
      (outputLine) => outputLine.data.length > 0
    );
    return JSON.parse(lineWithData.data) as Output;
  }

  private async runAndGetOutput(options: RunCliCommandOptions) {
    const childProcess = new ManagedProcessEntity({
      id: options.name.toLowerCase().replace(/ /g, "-"),
      name: options.name,
      command: {
        name: "flow",
        args: options.flowFlags.map((flag) => this.buildFlag(flag)).flat(),
        options: options.useProjectAsCwd
          ? {
              cwd: this.getRequiredProjectCwd(),
            }
          : undefined,
      },
    });
    return this.processManagerService.runUntilTermination(childProcess);
  }

  private buildFlag(flag: FlowCliFlag): string[] {
    if (typeof flag === "string") {
      return [flag];
    }

    if (flag.value !== undefined) {
      const shouldBeWrappedInQuotes = typeof flag.value !== "number";
      return [
        flag.key,
        shouldBeWrappedInQuotes ? `"${flag.value}"` : String(flag.value),
      ];
    }

    return [];
  }

  private getRequiredProjectCwd() {
    if (!this.projectContext) {
      throw new PreconditionFailedException(
        "Project context not set",
        "Missing project context when retrieving project path"
      );
    }
    return this.projectContext.filesystemPath;
  }
}
