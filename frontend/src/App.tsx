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
import { ProjectLayout } from "../../packages/ui/src/common/layouts/ProjectLayout/ProjectLayout";
import "./App.scss";
import { toastOptions } from "./config/toast";

import { ProjectsManagerProvider } from "./contexts/projects.context";
import { ConfirmDialogProvider } from "./contexts/confirm-dialog.context";
import { QueryClientProvider } from "react-query";
import { ProjectRequirements } from "../../packages/ui/src/common/misc/ProjectRequirements/ProjectRequirements";
import { TimeoutPollingProvider } from "./contexts/timeout-polling.context";
import {
  PlatformAdapterProvider,
  PlatformAdapterState,
} from "./contexts/platform-adapter.context";
import { queryClient } from "./config/react-query";
import { ConsentDialog } from "../../packages/ui/src/common/overlays/dialogs/consent/ConsentDialog";
import { useAnalytics } from "./hooks/use-analytics";
import { ServiceRegistry } from "./services/service-registry";
import { AnalyticEvent } from "./services/analytics.service";
import { InteractionsPage } from "../../packages/ui/src/interactions/InteractionsPage";
import { InteractionRegistryProvider } from "../../packages/ui/src/interactions/contexts/interaction-registry.context";
import { ProjectSettings } from "../../packages/ui/src/projects/ProjectSettings/ProjectSettings";
import {
  useGetPollingAccounts,
  useGetPollingBlocks,
  useGetPollingContracts,
  useGetEvents,
  useGetPollingTransactions,
} from "./hooks/use-api";
import { TransactionsTable } from "../../packages/ui/src/transactions/TransactionsTable/TransactionsTable";
import { TransactionDetails } from "../../packages/ui/src/transactions/TransactionDetails/TransactionDetails";
import { BlockDetails } from "../../packages/ui/src/blocks/BlockDetails/BlockDetails";
import { BlocksTable } from "../../packages/ui/src/blocks/BlocksTable/BlocksTable";
import { AccountDetails } from "../../packages/ui/src/accounts/AccountDetails/AccountDetails";
import { AccountsTable } from "../../packages/ui/src/accounts/AccountsTable/AccountsTable";
import { ProjectListPage } from "../../packages/ui/src/projects/ProjectListPage/ProjectListPage";
import { ContractsTable } from "../../packages/ui/src/contracts/ContractsTable/ContractsTable";
import { ContractDetails } from "../../packages/ui/src/contracts/ContractDetails/ContractDetails";
import { EventsTable } from "../../packages/ui/src/events/EventsTable/EventsTable";
import { createCrumbHandle } from "../../packages/ui/src/common/misc/Breadcrumbs/Breadcrumbs";
import { TemplatesRegistryProvider } from "../../packages/ui/src/interactions/contexts/templates.context";
import { BasicLayout } from "../../packages/ui/src/common/layouts/BasicLayout/BasicLayout";
import { EventDetails } from "../../packages/ui/src/events/EventDetails/EventDetails";
import { FlowConfigProvider } from "./contexts/flow.context";
import { SnapshotsManagerProvider } from "./contexts/snapshots.context";

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
      <ProjectsManagerProvider>
        <FlowConfigProvider>
          <SnapshotsManagerProvider>
            <BrowserRouterEvents>
              <Outlet />
            </BrowserRouterEvents>
          </SnapshotsManagerProvider>
        </FlowConfigProvider>
      </ProjectsManagerProvider>
    ),
    handle: createCrumbHandle({
      crumbName: "Projects",
    }),
    children: [
      {
        index: true,
        element: <ProjectListPage />,
      },
      {
        path: "create",
        element: (
          <BasicLayout>
            <ProjectSettingsPage />
          </BasicLayout>
        ),
        handle: createCrumbHandle({
          crumbName: "Create",
        }),
      },
      {
        path: ":projectId",
        element: (
          <ProjectLayout>
            <InteractionRegistryProvider>
              <TemplatesRegistryProvider>
                <Outlet />
              </TemplatesRegistryProvider>
            </InteractionRegistryProvider>
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
              {
                path: ":eventId",
                element: <EventDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: "Details",
                }),
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
  const { isConsented, setIsConsented } = useAnalytics();
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
  const { data } = useGetEvents();

  return <EventsTable events={data} />;
}

function EventDetailsPage() {
  const { eventId } = useParams();

  return <EventDetails eventId={eventId!} />;
}
