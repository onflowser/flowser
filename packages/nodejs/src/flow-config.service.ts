import { readFile, writeFile, watch } from "fs/promises";
import * as path from "path";
import { AbortController } from "node-abort-controller";
import * as fs from "fs";
import { IFlowserLogger, isObject } from "@onflowser/core";

type FlowAddress = string;

type FlowContractsConfig = Record<FlowContractName, FlowContractConfig>;

type FlowContractName = string;

type FlowContractPath = string;

type FlowContractConfig =
  | FlowContractPath
  | {
      source: FlowContractPath;
      aliases: Record<FlowNetworkName, FlowAddress>;
    };

type FlowDeploymentsConfig = Record<FlowNetworkName, FlowDeploymentConfig>;

type FlowDeploymentConfig = Record<FlowAccountName, FlowContractName[]>;

type FlowAccountsConfig = Record<FlowAccountName, FlowAccountConfig>;

type FlowAccountName = "emulator-account" | string;

type FlowAccountConfig = {
  address?: string;
  key?: FlowAccountKeyConfig;
};

type FlowAccountKeySimpleConfig = string;
type FlowAccountKeyAdvancedConfig = {
  type?: string;
  index?: number;
  signatureAlgorithm?: string;
  hashAlgorithm?: string;
  privateKey?: string;
};
type FlowAccountKeyConfig =
  | FlowAccountKeySimpleConfig
  | FlowAccountKeyAdvancedConfig;

type FlowNetworksConfig = Record<FlowNetworkName, FlowNetworkConfig>;

type FlowNetworkName = "testnet" | "emulator" | "mainnet" | string;
type FlowNetworkAddress = string;
type FlowNetworkConfig =
  | FlowNetworkAddress
  | {
      Host: FlowNetworkAddress;
      NetworkKey: string;
    };

type FlowJSON = {
  contracts?: FlowContractsConfig;
  deployments?: FlowDeploymentsConfig;
  accounts?: FlowAccountsConfig;
  networks?: FlowNetworksConfig;
};

// Exposes the account configuration in a single standard format.
// This is a "boundary" type to hide the implementation detail
// of multiple configuration formats.
export type FlowAbstractAccountConfig = {
  name: string;
  // Possibly without the '0x' prefix.
  address: string;
  privateKey: string | undefined;
};

export type FlowAbstractContractConfig = {
  name: string;
  // Path relative to the project root dir.
  relativePath: string;
  absolutePath: string;
};

type FlowConfigServiceConfig = {
  workspacePath: string;
};

export class FlowConfigService {
  private fileListenerController: AbortController | undefined;
  private config: FlowJSON | undefined;
  private configFileName = "flow.json";
  private workingDirectoryPath: string | undefined;

  constructor(private readonly logger: IFlowserLogger) {}

  public async configure(config: FlowConfigServiceConfig) {
    this.workingDirectoryPath = config.workspacePath;
    await this.reload();
  }

  public cleanup() {
    this.workingDirectoryPath = undefined;
    this.detachListeners();
  }

  public getFlowJSON(): FlowJSON | undefined {
    return this.config;
  }

  public async reload() {
    this.detachListeners();
    await this.load();
    this.attachListeners();
  }

  public getAccounts(): FlowAbstractAccountConfig[] {
    if (!this.config?.accounts) {
      throw new Error("Accounts config not loaded");
    }
    const accountEntries = Object.entries(this.config.accounts);

    return accountEntries.map(
      ([name, accountConfig]): FlowAbstractAccountConfig => {
        if (!accountConfig.address) {
          throw this.missingConfigError(
            `accounts.${accountConfig.address}.address`,
          );
        }
        if (!accountConfig.key) {
          throw this.missingConfigError(
            `accounts.${accountConfig.address}.key`,
          );
        }
        return {
          name,
          address: accountConfig.address,
          privateKey: this.getPrivateKey(accountConfig.key),
        };
      },
    );
  }

  public getContracts(): FlowAbstractContractConfig[] {
    if (!this.config?.contracts) {
      throw new Error("Contracts config not loaded");
    }
    const contractNamesAndPaths = Object.keys(this.config.contracts ?? {}).map(
      (nameKey) => ({
        name: nameKey,
        filePath: this.getContractFilePath(nameKey),
      }),
    );

    return contractNamesAndPaths
      .filter((contract) => Boolean(contract.filePath))
      .map(
        (contract): FlowAbstractContractConfig => ({
          name: contract.name,
          relativePath: contract.filePath,
          absolutePath: this.buildProjectPath(contract.filePath),
        }),
      );
  }

  private getContractFilePath(contractNameKey: string) {
    if (!this.config?.contracts) {
      throw new Error("Contracts config not loaded");
    }
    const contractConfig = this.config.contracts[contractNameKey];
    const isSimpleFormat = typeof contractConfig === "string";
    return isSimpleFormat ? contractConfig : contractConfig?.source;
  }

  public async updateAccounts(
    newOrUpdatedAccounts: FlowAbstractAccountConfig[],
  ): Promise<void> {
    if (!this.config?.accounts) {
      throw new Error("Accounts config not loaded");
    }
    for (const newOrUpdatedAccount of newOrUpdatedAccounts) {
      this.config.accounts[newOrUpdatedAccount.name] = {
        address: newOrUpdatedAccount.address,
        key: newOrUpdatedAccount.privateKey,
      };
    }
    await this.save();
  }

  private getPrivateKey(keyConfig: FlowAccountKeyConfig): string | undefined {
    // Private keys can also be defined in external files or env variables,
    // but for now just ignore those, since those are likely very sensitive credentials,
    // that should be used for deployments only.
    // See: https://developers.flow.com/next/tools/toolchains/flow-cli/flow.json/configuration#accounts
    return typeof keyConfig === "string" ? keyConfig : keyConfig.privateKey;
  }

  public hasConfigFile(): boolean {
    return fs.existsSync(this.getConfigPath());
  }

  private async attachListeners() {
    this.fileListenerController = new AbortController();
    const { signal } = this.fileListenerController;
    try {
      // @ts-ignore AbortController type (because it's a polyfill)
      const watcher = watch(this.getConfigPath(), { signal });
      for await (const event of watcher) {
        // TODO(milestone-x): Refresh dependant services when config changes
        await this.load();
      }
    } catch (error) {
      if (isObject(error) && error["name"] !== "AbortError") {
        throw error;
      }
    }
  }

  private detachListeners() {
    this.fileListenerController?.abort();
  }

  private async load() {
    try {
      const data = await this.readProjectFile(this.configFileName);
      this.config = JSON.parse(data);
    } catch (e) {
      this.logger.error("Config read error", e);
    }
  }

  private async save() {
    await this.writeProjectFile(
      this.configFileName,
      JSON.stringify(this.config, null, 4),
    );
  }

  private getConfigPath() {
    return this.buildProjectPath(this.configFileName);
  }

  private async readProjectFile(pathPostfix: string) {
    const data = await readFile(this.buildProjectPath(pathPostfix));
    return data.toString();
  }

  private async writeProjectFile(pathPostfix: string, data: string) {
    return writeFile(this.buildProjectPath(pathPostfix), data);
  }

  private buildProjectPath(pathPostfix: string) {
    if (!pathPostfix) {
      throw new Error("Postfix path not provided");
    }
    if (!this.workingDirectoryPath) {
      throw new Error("FlowConfigService not configured");
    }
    return path.join(this.workingDirectoryPath, pathPostfix);
  }

  private missingConfigError(path: string) {
    return new Error(`Missing flow.json configuration key: ${path}`);
  }
}
