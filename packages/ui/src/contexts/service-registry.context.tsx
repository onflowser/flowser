import { createContext, ReactNode, useContext } from "react";
import {
  FlowAccount,
  FlowAccountStorage,
  FlowBlock,
  FlowContract,
  FlowEvent,
  FlowserWorkspace,
  FlowStateSnapshot,
  FlowTransaction,
  IResourceIndexReader, ManagedProcessOutput
} from '@onflowser/api';

interface IWalletService {
  // TODO(restructure): Provide request/response type
  sendTransaction(request: any): Promise<any>;
  createAccount(): Promise<void>;
}

interface ISnapshotService extends IResourceIndexReader<FlowStateSnapshot> {
  // TODO(restructure): Provide request/response type
  create(request: any): Promise<void>;
  checkoutBlock(request: any): Promise<void>;
  rollback(request: any): Promise<void>;
}

interface IWorkspaceService {
  remove(id: string): Promise<void>;
  close(id: string): Promise<void>;
  create(workspace: FlowserWorkspace): Promise<void>;
  update(workspace: FlowserWorkspace): Promise<void>;
  open(id: string): Promise<void>;
  list(): Promise<FlowserWorkspace[]>;
  findById(id: string): Promise<FlowserWorkspace | undefined>;
  getDefaultSettings(): Promise<FlowserWorkspace>;
}

interface IAnalyticsService {
  disable(): void;
  enable(): void;
  track(event: string, properties?: Record<string, unknown>): void;
}

interface IMonitoringService {
  captureError(error: unknown, options?: Record<string, unknown>): void;
}

type ServiceRegistry = {
  walletService: IWalletService;
  snapshotService: ISnapshotService;
  workspaceService: IWorkspaceService;
  analyticsService: IAnalyticsService;
  monitoringService: IMonitoringService;
  accountIndex: IResourceIndexReader<FlowAccount>;
  accountStorageIndex: IResourceIndexReader<FlowAccountStorage>;
  contractIndex: IResourceIndexReader<FlowContract>;
  transactionsIndex: IResourceIndexReader<FlowTransaction>;
  blocksIndex: IResourceIndexReader<FlowBlock>;
  eventsIndex: IResourceIndexReader<FlowEvent>;
  processOutputIndex: IResourceIndexReader<ManagedProcessOutput>;
};

const ServiceRegistryContext = createContext<ServiceRegistry>(
  undefined as never
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

export function useServiceRegistry() {
  const context = useContext(ServiceRegistryContext);

  if (context === undefined) {
    throw new Error("ServiceRegistryContext not found");
  }

  return context;
}
