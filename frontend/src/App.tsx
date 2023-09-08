import React, { ReactElement, ReactNode, useEffect } from "react";
import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
  Outlet,
  RouteObject,
  RouterProvider,
  useLocation,
  useParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { BackButtonLayout, ProjectLayout } from "./components/layout/Layout";
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
import { ProjectSettings } from "./modules/projects/ProjectSettings/ProjectSettings";
import {
  useGetPollingAccounts,
  useGetPollingBlocks,
  useGetPollingContracts,
  useGetPollingEvents,
  useGetPollingTransactions,
} from "./hooks/use-api";
import { TransactionsTable } from "./modules/transactions/TransactionsTable/TransactionsTable";
import { TransactionDetails } from "./modules/transactions/TransactionDetails/TransactionDetails";
import { BlockDetails } from "./modules/blocks/BlockDetails/BlockDetails";
import { BlocksTable } from "./modules/blocks/BlocksTable/BlocksTable";
import { AccountDetails } from "./modules/accounts/AccountDetails/AccountDetails";
import { AccountsTable } from "./modules/accounts/AccountsTable/AccountsTable";
import { ProjectListPage } from "./modules/projects/ProjectListPage/ProjectListPage";
import { ContractsTable } from "./modules/contracts/ContractsTable";
import { ContractDetails } from "./modules/contracts/ContractDetails/ContractDetails";
import { EventsTable } from "./modules/events/EventsTable/EventsTable";
import { createCrumbHandle } from "./components/breadcrumbs/Breadcrumbs";

const BrowserRouterEvents = (props: { children: ReactNode }): ReactElement => {
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
  useHashRouter?: boolean;
  platformAdapter: PlatformAdapterState;
  enableTimeoutPolling?: boolean;
};

export const FlowserClientApp = ({
  useHashRouter,
  platformAdapter,
  enableTimeoutPolling = true,
}: FlowserClientAppProps): ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <TimeoutPollingProvider enabled={enableTimeoutPolling}>
        <ConfirmDialogProvider>
          <PlatformAdapterProvider {...platformAdapter}>
            <InteractionRegistryProvider>
              <ConsentAnalytics />
              <ProjectRequirements />
              <RouterProvider
                router={useHashRouter ? hashRouter : browserRouter}
              />
              <Toaster
                position="bottom-center"
                gutter={8}
                toastOptions={toastOptions}
              />
            </InteractionRegistryProvider>
          </PlatformAdapterProvider>
        </ConfirmDialogProvider>
      </TimeoutPollingProvider>
    </QueryClientProvider>
  );
};

const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="projects" replace />,
  },
  {
    path: "projects",
    element: (
      <ProjectProvider>
        <BrowserRouterEvents>
          <Outlet />
        </BrowserRouterEvents>
      </ProjectProvider>
    ),
    children: [
      {
        index: true,
        element: <ProjectListPage />,
      },
      {
        path: "create",
        element: (
          <BackButtonLayout>
            <ProjectSettingsPage />
          </BackButtonLayout>
        ),
      },
      {
        path: ":projectId",
        element: (
          <ProjectLayout>
            <Outlet />
          </ProjectLayout>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="interactions" replace />,
          },
          {
            path: "settings",
            element: <ProjectSettingsPage />,
          },
          {
            path: "accounts",
            handle: createCrumbHandle({
              crumbName: "Accounts",
            }),
            children: [
              {
                index: true,
                element: <AccountsTablePage />,
              },
              {
                path: ":accountId",
                element: <AccountDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: "Details",
                }),
              },
            ],
          },
          {
            path: "blocks",
            handle: createCrumbHandle({
              crumbName: "Blocks",
            }),
            children: [
              {
                index: true,
                element: <BlocksTablePage />,
              },
              {
                path: ":blockId",
                element: <BlockDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: "Details",
                }),
              },
            ],
          },
          {
            path: "transactions",
            handle: createCrumbHandle({
              crumbName: "Transactions",
            }),
            children: [
              {
                index: true,
                element: <TransactionsTablePage />,
              },
              {
                path: ":transactionId",
                element: <TransactionDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: "Details",
                }),
              },
            ],
          },
          {
            path: "contracts",
            handle: createCrumbHandle({
              crumbName: "Contracts",
            }),
            children: [
              {
                index: true,
                element: <ContractsTablePage />,
              },
              {
                path: ":contractId",
                element: <ContractDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: "Details",
                }),
              },
            ],
          },
          {
            path: "events",
            handle: createCrumbHandle({
              crumbName: "Events",
            }),
            children: [
              {
                index: true,
                element: <EventsTablePage />,
              },
            ],
          },
          {
            path: "interactions",
            children: [
              {
                index: true,
                element: <InteractionsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
];

const browserRouter = createBrowserRouter(routes);
const hashRouter = createHashRouter(routes);

function ConsentAnalytics() {
  const { isConsented, setIsConsented } = useAnalyticsConsent();
  if (isConsented !== undefined) {
    return null;
  }
  return (
    <ConsentDialog consent={isConsented ?? true} setConsent={setIsConsented} />
  );
}

function ProjectSettingsPage() {
  const { projectId } = useParams();

  return <ProjectSettings projectId={projectId!} />;
}

function TransactionsTablePage() {
  const { data } = useGetPollingTransactions();

  return <TransactionsTable transactions={data} />;
}

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

function EventsTablePage() {
  const { data } = useGetPollingEvents();

  return <EventsTable events={data} />;
}
