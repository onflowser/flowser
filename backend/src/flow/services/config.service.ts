import {
  Injectable,
  Logger,
  PreconditionFailedException,
} from "@nestjs/common";
import { readFile, writeFile } from "fs/promises";
import * as path from "path";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import {
  ContractTemplate,
  TransactionTemplate,
} from "@flowser/types/generated/entities/config";
import * as fs from "fs";

type FlowAddress = string;

export type FlowContractsConfig = Record<FlowContractName, FlowContractConfig>;

type FlowContractName = string;

type FlowContractPath = string;

type FlowContractConfig =
  | FlowContractPath
  | {
      source: FlowContractPath;
      aliases: Record<FlowNetworkName, FlowAddress>;
    };

export type FlowDeploymentsConfig = Record<
  FlowNetworkName,
  FlowDeploymentConfig
>;

type FlowDeploymentConfig = Record<FlowAccountName, FlowContractName[]>;

export type FlowAccountsConfig = Record<FlowAccountName, FlowAccountConfig>;

type FlowAccountName = "emulator-account" | string;

// TODO(milestone-3): add support for advanced account format
// https://developers.flow.com/tools/flow-cli/configuration#advanced-format
type FlowAccountConfig = {
  address: string;
  key: string;
};

export type FlowNetworksConfig = Record<FlowNetworkName, FlowNetworkConfig>;

type FlowNetworkName = "testnet" | "emulator" | "mainnet" | string;
type FlowNetworkAddress = string;
type FlowNetworkConfig =
  | FlowNetworkAddress
  | {
      Host: FlowNetworkAddress;
      NetworkKey: string;
    };

export type FlowCliConfig = {
  contracts?: FlowContractsConfig;
  deployments?: FlowDeploymentsConfig;
  accounts?: FlowAccountsConfig;
  networks?: FlowNetworksConfig;
};

@Injectable()
export class FlowConfigService implements ProjectContextLifecycle {
  private logger = new Logger(FlowConfigService.name);
  private config: FlowCliConfig = {};
  // TODO(milestone-3): Config may not always be present in the project root
  // Handle cases when it's not or just alert the user that config must be put in root
  private configFileName = "flow.json";
  private projectContext: ProjectEntity | undefined;

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (!fs.existsSync(this.getConfigPath())) {
      throw new PreconditionFailedException("flow.json config file is missing");
    }
    // TODO(milestone-x): listen on flow.json changes, reload config and restart emulator, etc...
    await this.load();
  }

  onExitProjectContext() {
    this.projectContext = undefined;
  }

  async getContractTemplates(): Promise<ContractTemplate[]> {
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

  private getContractFilePath(contractNameKey: string) {
    const contractConfig = this.config.contracts[contractNameKey];
    const isSimpleFormat = typeof contractConfig === "string";
    return isSimpleFormat ? contractConfig : contractConfig?.source;
  }

  async getTransactionTemplates(): Promise<TransactionTemplate[]> {
    // TODO(milestone-x): Is there a way to retrieve all project transaction files?
    // For now we can't reliably tell where are transactions source files located,
    // because they are not defined in flow.json config file - but this may be doable in the future.
    // For now we have 2 options:
    // - try to find a /transactions folder and read all files (hopefully transactions) within it
    // - provide a Flowser setting to specify a path to the transactions folder
    return [];
  }

  async load() {
    const data = await this.readProjectFile(this.configFileName);
    this.config = JSON.parse(data);
  }

  async save() {
    await this.writeProjectFile(
      this.configFileName,
      JSON.stringify(this.config, null, 4)
    );
  }

  getAccountConfig(accountKey: string) {
    return this.config.accounts[accountKey];
  }

  // TODO(milestone-3): is account under "emulator-account" key considered as "service account"?
  getServiceAccountAddress() {
    return this.getAccountConfig("emulator-account")?.address;
  }

  getDatabasePath() {
    return this.buildProjectPath(this.projectContext?.emulator.databasePath);
  }

  getConfigPath() {
    return this.buildProjectPath("flow.json");
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
