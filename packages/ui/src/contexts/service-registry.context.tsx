import { createContext, ReactNode, useContext } from "react";
import {
  FclArgumentWithMetadata,
  FlowAccount,
  FlowAccountKey,
  FlowAccountStorage,
  FlowBlock,
  FlowCliInfo,
  FlowContract,
  FlowEvent,
  FlowserWorkspace,
  FlowStateSnapshot,
  FlowTransaction,
  InteractionTemplate,
  IResourceIndexReader,
  ManagedProcessOutput,
  ParsedInteractionOrError,
  ManagedKeyPair,
} from "@onflowser/api";

export interface ISnapshotService {
  list(): Promise<FlowStateSnapshot[]>;
  create(name: string): Promise<void>;
  jumpTo(name: string): Promise<void>;
  rollbackToHeight(height: number): Promise<void>;
}

export interface IWorkspaceService {
  remove(id: string): Promise<void>;
  close(id: string): Promise<void>;
  create(workspace: FlowserWorkspace): Promise<void>;
  update(workspace: FlowserWorkspace): Promise<void>;
  open(id: string): Promise<void>;
  list(): Promise<FlowserWorkspace[]>;
  findById(id: string): Promise<FlowserWorkspace | undefined>;
  getDefaultSettings(): Promise<FlowserWorkspace>;
}

export interface IInteractionService {
  parse(sourceCode: string): Promise<ParsedInteractionOrError>;
  getTemplates(): Promise<InteractionTemplate[]>;
}

export type SendTransactionRequest = {
  // TODO(web): These should probably be of type FlowAuthorizationFunction when generalizing for web version
  cadence: string;
  proposerAddress: string;
  payerAddress: string;
  authorizerAddresses: string[];
  arguments: FclArgumentWithMetadata[];
};

export type ExecuteScriptRequest = {
  cadence: string;
  arguments: FclArgumentWithMetadata[];
};

export interface IFlowService {
  sendTransaction(
    request: SendTransactionRequest,
  ): Promise<{ transactionId: string }>;
  executeScript(request: ExecuteScriptRequest): Promise<any>;
  getIndexOfAddress(address: string): Promise<number>;
  getFlowCliInfo(): Promise<FlowCliInfo>;
}

export type FlowConfigAccount = {
  name: string;
  address: string;
  privateKey: string | undefined;
};

export type FlowConfigContract = {
  name: string;
  // Path relative to the project root dir.
  relativePath: string;
  absolutePath: string;
};

export interface IFlowConfigService {
  getAccounts(): Promise<FlowConfigAccount[]>;
  getContracts(): Promise<FlowConfigContract[]>;
}

export interface IWalletService {
  createAccount(): Promise<void>;
  listKeyPairs(): Promise<ManagedKeyPair[]>;
}

interface IAnalyticsService {
  disable(): void;
  enable(): void;
  track(event: string, properties?: Record<string, unknown>): void;
}

interface IMonitoringService {
  captureError(error: unknown, options?: Record<string, unknown>): void;
}

export interface IProcessManagerService {
  findAllLogsByProcessId(processId: string): Promise<ManagedProcessOutput[]>;
}

type ServiceRegistry = {
  interactionsService: IInteractionService;
  flowService: IFlowService;
  flowConfigService: IFlowConfigService;
  walletService: IWalletService;
  snapshotService: ISnapshotService;
  workspaceService: IWorkspaceService;
  analyticsService: IAnalyticsService;
  monitoringService: IMonitoringService;
  processManagerService: IProcessManagerService;
  accountIndex: IResourceIndexReader<FlowAccount>;
  accountStorageIndex: IResourceIndexReader<FlowAccountStorage>;
  contractIndex: IResourceIndexReader<FlowContract>;
  transactionsIndex: IResourceIndexReader<FlowTransaction>;
  blocksIndex: IResourceIndexReader<FlowBlock>;
  eventsIndex: IResourceIndexReader<FlowEvent>;
  accountKeyIndex: IResourceIndexReader<FlowAccountKey>;
};

const ServiceRegistryContext = createContext<ServiceRegistry>(
  undefined as never,
);

type ServiceRegistryProviderProps = {
  children: ReactNode;
  services: ServiceRegistry;
};

export function ServiceRegistryProvider(props: ServiceRegistryProviderProps) {
  return (
    <ServiceRegistryContext.Provider value={props.services}>
      {props.children}
    </ServiceRegistryContext.Provider>
  );
}

export function useServiceRegistry(): ServiceRegistry {
  const context = useContext(ServiceRegistryContext);

  if (context === undefined) {
    throw new Error("ServiceRegistryContext not found");
  }

  return context;
}
