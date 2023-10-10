import { createContext, useContext } from "react";
import { AnalyticsService } from "./analytics.service";
import { FlowserProject } from "@onflowser/api";

interface FlowserWalletService {
  // TODO(restructure): Provide request/response type
  sendTransaction(request: any): Promise<any>;
  createAccount(): Promise<void>;
}

interface SnapshotService {
  // TODO(restructure): Provide request/response type
  create(request: any): Promise<void>;
  checkoutBlock(request: any): Promise<void>;
}

interface FlowserProjectService {
  remove(projectId: string): Promise<void>;
  // TODO(restructure): Can we remove these methods
  unUseCurrentProject(): Promise<void>;
  useProject(projectId: string): Promise<void>;
  getSingle(projectId: string): Promise<FlowserProject>;
  getDefaultProjectInfo(): Promise<FlowserProject>;
}

type ServiceRegistry = {
  walletService: FlowserWalletService;
  snapshotService: SnapshotService;
  projectsService: FlowserProjectService;
  analyticsService: AnalyticsService;
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
