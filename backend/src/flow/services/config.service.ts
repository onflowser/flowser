import { Injectable, Logger } from "@nestjs/common";
import { readFile, writeFile, watch } from "fs/promises";
import * as path from "path";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/project.entity";
import { ContractTemplate, TransactionTemplate } from "@flowser/shared";
import { AbortController } from "node-abort-controller";
import * as fs from "fs";
import { isObject } from "../../utils";

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
  address: string;
  key: FlowAccountKeyConfig;
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

type FlowCliConfig = {
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
  privateKey: string;
};

@Injectable()
export class FlowConfigService implements ProjectContextLifecycle {
  private logger = new Logger(FlowConfigService.name);
  private fileListenerController: AbortController | undefined;
  private config: FlowCliConfig = {};
  private configFileName = "flow.json";
  private projectContext: ProjectEntity | undefined;

  public async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    await this.reload();
  }

  public onExitProjectContext() {
    this.projectContext = undefined;
    this.detachListeners();
  }

  public async reload() {
    this.logger.debug("Reloading flow.json config");
    this.detachListeners();
    await this.load();
    this.attachListeners();
  }

  public getAccounts(): FlowAbstractAccountConfig[] {
    const accountEntries = Object.entries(this.config.accounts);

    return accountEntries.map(
      ([name, config]): FlowAbstractAccountConfig => ({
        name,
        address: config.address,
        privateKey: this.getPrivateKey(config.key),
      })
    );
  }

  private getPrivateKey(keyConfig: FlowAccountKeyConfig) {
    if (typeof keyConfig === "string") {
      return keyConfig;
    } else {
      return keyConfig.privateKey;
    }
  }

  public async getContractTemplates(): Promise<ContractTemplate[]> {
    const contractNamesAndPaths = Object.keys(this.config.contracts ?? {}).map(
      (nameKey) => ({
        name: nameKey,
        filePath: this.getContractFilePath(nameKey),
      })
    );

    const contractsSourceCode = await Promise.all(
      contractNamesAndPaths.map(({ filePath }) =>
        this.readProjectFile(filePath)
      )
    );

    return contractNamesAndPaths.map(({ name, filePath }, index) =>
      ContractTemplate.fromPartial({
        name,
        filePath,
        sourceCode: contractsSourceCode[index],
      })
    );
  }

  public async getTransactionTemplates(): Promise<TransactionTemplate[]> {
    // TODO(milestone-x): Is there a way to retrieve all project transaction files?
    // For now we can't reliably tell where are transactions source files located,
    // because they are not defined in flow.json config file - but this may be doable in the future.
    // For now we have 2 options:
    // - try to find a /transactions folder and read all files (hopefully transactions) within it
    // - provide a Flowser setting to specify a path to the transactions folder
    return [];
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
      this.logger.debug("watch error", error);
      if (isObject(error) && error["name"] !== "AbortError") {
        throw error;
      }
    }
  }

  private detachListeners() {
    this.fileListenerController?.abort();
  }

  private getContractFilePath(contractNameKey: string) {
    const contractConfig = this.config.contracts[contractNameKey];
    const isSimpleFormat = typeof contractConfig === "string";
    return isSimpleFormat ? contractConfig : contractConfig?.source;
  }

  private async load() {
    try {
      const data = await this.readProjectFile(this.configFileName);
      this.config = JSON.parse(data);
    } catch (e) {
      this.logger.debug("Config read error", e);
    }
  }

  private async save() {
    await this.writeProjectFile(
      this.configFileName,
      JSON.stringify(this.config, null, 4)
    );
  }

  private getAccountConfig(accountKey: string) {
    return this.config.accounts[accountKey];
  }

  private getDatabasePath() {
    return this.buildProjectPath(this.projectContext?.emulator.databasePath);
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

  private buildProjectPath(pathPostfix: string | undefined | null) {
    if (!pathPostfix) {
      return null;
    }
    // TODO(milestone-3): Detect if pathPostfix is absolute or relative and use it accordingly
    return path.join(this.projectContext.filesystemPath, pathPostfix);
  }
}
