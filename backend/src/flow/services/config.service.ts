import { Injectable, Logger } from "@nestjs/common";
import { readFile, writeFile } from "fs/promises";
import path from "path";
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

  onEnterProjectContext(project: ProjectEntity): void {
    this.projectContext = project;
  }
  onExitProjectContext(): void {
    this.projectContext = undefined;
  }

  async load() {
    const data = await readFile(this.getConfigPath());
    this.config = JSON.parse(data.toString());
  }

  async save() {
    await writeFile(this.getConfigPath(), JSON.stringify(this.config, null, 4));
  }

  getServiceAccountAddress() {
    // TODO(milestone-3): we should probably read this address from:
    // this.config.accounts?.["emulator-account"]?.address;
    return "f8d6e0586b0a20c7";
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
