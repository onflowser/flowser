import { Injectable, Logger } from "@nestjs/common";
import { readFile, writeFile } from "fs/promises";
import * as path from "path";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";

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
  private projectContext: ProjectEntity | undefined;

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    // TODO(milestone-x): listen on flow.json changes, reload config and restart emulator, etc...
    await this.load();
  }

  onExitProjectContext() {
    this.projectContext = undefined;
  }

  async load() {
    const data = await readFile(this.getConfigPath());
    this.config = JSON.parse(data.toString());
  }

  async save() {
    await writeFile(this.getConfigPath(), JSON.stringify(this.config, null, 4));
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

  private buildProjectPath(pathPostfix: string | undefined | null) {
    if (!pathPostfix) {
      return null;
    }
    return path.join(this.projectContext.filesystemPath, pathPostfix);
  }
}
