import { createContext, useContext } from "react";
import { FlowserProject } from "@onflowser/api";

interface IWalletService {
  // TODO(restructure): Provide request/response type
  sendTransaction(request: any): Promise<any>;
  createAccount(): Promise<void>;
}

interface ISnapshotService {
  // TODO(restructure): Provide request/response type
  create(request: any): Promise<void>;
  checkoutBlock(request: any): Promise<void>;
  rollback(request: any): Promise<void>;
}

interface IProjectService {
  remove(projectId: string): Promise<void>;
  // TODO(restructure): Can we remove these methods
  unUseCurrentProject(): Promise<void>;
  useProject(projectId: string): Promise<void>;
  getSingle(projectId: string): Promise<FlowserProject>;
  getDefaultProjectInfo(): Promise<FlowserProject>;
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
  projectsService: IProjectService;
  analyticsService: IAnalyticsService;
  monitoringService: IMonitoringService;
};

const ServiceRegistryContext = createContext<ServiceRegistry>(
  undefined as never
);

export function useServiceRegistry() {
  const context = useContext(ServiceRegistryContext);

  if (context === undefined) {
    throw new Error("ServiceRegistryContext not found");
  }

  return context;
}
