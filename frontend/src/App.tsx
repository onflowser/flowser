import React, { FunctionComponent, ReactElement, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { BackButtonLayout, ProjectLayout } from "./components/layout/Layout";
import { UiStateContextProvider } from "./contexts/ui-state.context";
import "./App.scss";
import { toastOptions } from "./config/toast";

import { ProjectProvider } from "./contexts/project.context";
import { ConfirmDialogProvider } from "./contexts/confirm-dialog.context";
import { QueryClientProvider } from "react-query";
import { ProjectRequirements } from "./components/requirements/ProjectRequirements";
import { TimeoutPollingProvider } from "./contexts/timeout-polling.context";
import {
  PlatformAdapterProvider,
  PlatformAdapterState,
} from "./contexts/platform-adapter.context";
import { queryClient } from "./config/react-query";
import { ConsentDialog } from "./components/dialogs/consent/ConsentDialog";
import { useAnalyticsConsent } from "./hooks/use-analytics-consent";
import { ServiceRegistry } from "./services/service-registry";
import { AnalyticEvent } from "./services/analytics.service";
import { InteractionsPage } from "./modules/interactions/InteractionsPage";
import { InteractionRegistryProvider } from "modules/interactions/contexts/interaction-registry.context";
import { ProjectSettings } from "./modules/projects/settings/ProjectSettings";
import {
  useGetPollingAccounts,
  useGetPollingBlocks,
  useGetPollingContracts,
  useGetPollingEvents,
  useGetPollingTransactions,
} from "./hooks/use-api";
import { TransactionsTable } from "./modules/transactions/TransactionsTable/TransactionsTable";
import { TransactionDetails } from "./modules/transactions/details/TransactionDetails";
import { BlockDetails } from "./modules/blocks/details/Details";
import { BlocksTable } from "./modules/blocks/BlocksTable/BlocksTable";
import { AccountDetails } from "./modules/accounts/details/AccountDetails";
import { AccountsTable } from "./modules/accounts/AccountsTable";
import { ProjectListPage } from "./modules/projects/ProjectListPage/ProjectListPage";
import { ContractsTable } from "./modules/contracts/ContractsTable";
import { ContractDetails } from "./modules/contracts/details/ContractDetails";
import { EventsTable } from "./modules/events/EventsTable/EventsTable";

const BrowserRouterEvents = (props: {
  children: ReactElement[];
}): ReactElement => {
  const location = useLocation();
  const { analyticsService } = ServiceRegistry.getInstance();

  useEffect(() => {
    analyticsService.track(AnalyticEvent.PAGE_VIEW, {
      location,
    });
  }, [location]);

  useEffect(() => {
    // scroll to the top on every route change
    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
};

export type FlowserClientAppProps = {
  platformAdapter: PlatformAdapterState;
  enableTimeoutPolling?: boolean;
};

export const FlowserClientApp = ({
  platformAdapter,
  enableTimeoutPolling = true,
}: FlowserClientAppProps): ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <TimeoutPollingProvider enabled={enableTimeoutPolling}>
        <BrowserRouter>
          <ConfirmDialogProvider>
            <UiStateContextProvider>
              <PlatformAdapterProvider {...platformAdapter}>
                <ProjectProvider>
                  <InteractionRegistryProvider>
                    <FlowserRoutes />
                  </InteractionRegistryProvider>
                </ProjectProvider>
              </PlatformAdapterProvider>
            </UiStateContextProvider>
          </ConfirmDialogProvider>
        </BrowserRouter>
      </TimeoutPollingProvider>
    </QueryClientProvider>
  );
};

export const FlowserRoutes = (): ReactElement => {
  return (
    <BrowserRouterEvents>
      <ConsentAnalytics />
      <ProjectRequirements />
      <Routes>
        <Route path="projects">
          <Route index element={<ProjectListPage />} />
          <Route
            path="create"
            element={
              <BackButtonLayout>
                <ProjectSettingsPage />
              </BackButtonLayout>
            }
          />
        </Route>
        <Route path="accounts">
          <Route index element={<AccountsTablePage />} />
          <Route path=":accountId" element={<AccountDetailsPage />} />
        </Route>
        <Route path="blocks">
          <Route index element={<BlocksTablePage />} />
          <Route path=":blockId" element={<BlockDetailsPage />} />
        </Route>
        <Route path="transactions">
          <Route index element={<TransactionsTablePage />} />
          <Route path=":transactionId" element={<TransactionDetailsPage />} />
        </Route>
        <Route path="contracts">
          <Route index element={<ContractsTablePage />} />
          <Route path=":contractId" element={<ContractDetailsPage />} />
        </Route>
        <Route
          path="events"
          element={
            <ProjectLayout>
              <EventsTablePage />
            </ProjectLayout>
          }
        />
        <Route
          path="interactions"
          element={
            <ProjectLayout>
              <InteractionsPage />
            </ProjectLayout>
          }
        />
        <Route
          path=":projectId"
          element={
            <ProjectLayout>
              <ProjectSettingsPage />
            </ProjectLayout>
          }
        />
      </Routes>
      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={toastOptions}
      />
    </BrowserRouterEvents>
  );
};

function ConsentAnalytics() {
  const { isConsented, setIsConsented } = useAnalyticsConsent();
  if (isConsented) {
    return null;
  }
  return <ConsentDialog consent={isConsented} setConsent={setIsConsented} />;
}

function ProjectSettingsPage() {
  const { projectId } = useParams();

  return <ProjectSettings projectId={projectId!} />;
}

const TransactionsTablePage: FunctionComponent = () => {
  const { data } = useGetPollingTransactions();

  return <TransactionsTable transactions={data} />;
};

function TransactionDetailsPage() {
  const { transactionId } = useParams();

  return <TransactionDetails transactionId={transactionId!} />;
}

function BlocksTablePage() {
  const { data } = useGetPollingBlocks();

  return <BlocksTable blocks={data} />;
}

function BlockDetailsPage() {
  const { blockId } = useParams();

  return <BlockDetails blockId={blockId!} />;
}

function AccountsTablePage() {
  const { data } = useGetPollingAccounts();

  return <AccountsTable accounts={data} />;
}

function AccountDetailsPage() {
  const { accountId } = useParams();

  return <AccountDetails accountId={accountId!} />;
}

function ContractsTablePage() {
  const { data } = useGetPollingContracts();

  return <ContractsTable contracts={data} />;
}

function ContractDetailsPage() {
  const { contractId } = useParams();

  return <ContractDetails contractId={contractId!} />;
}

export const EventsTablePage: FunctionComponent = () => {
  const { data } = useGetPollingEvents();

  return <EventsTable events={data} />;
};
