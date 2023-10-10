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
import { ProjectsManagerProvider } from "../../packages/ui/src/contexts/projects.context";
import { ConfirmDialogProvider } from "../../packages/ui/src/contexts/confirm-dialog.context";
import { QueryClientProvider } from "react-query";
import { FlowserUsageRequirements } from "../../packages/ui/src/common/misc/FlowserUsageRequirements/FlowserUsageRequirements";
import {
  PlatformAdapterProvider,
  PlatformAdapterState,
} from "../../packages/ui/src/contexts/platform-adapter.context";
import { ConsentDialog } from "../../packages/ui/src/common/overlays/dialogs/consent/ConsentDialog";
import { useAnalytics } from "../../packages/ui/src/hooks/use-analytics";
import { ServiceRegistry } from "./services/service-registry";
import { AnalyticEvent } from "../../packages/ui/src/contexts/analytics.service";
import { InteractionsPage } from "../../packages/ui/src/interactions/InteractionsPage";
import { InteractionRegistryProvider } from "../../packages/ui/src/interactions/contexts/interaction-registry.context";
import { ProjectSettings } from "../../packages/ui/src/projects/ProjectSettings/ProjectSettings";
import { useFlowserHooksApi } from "../../packages/ui/src/contexts/flowser-api.context";
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
import { FlowConfigProvider } from "../../packages/ui/src/contexts/flow.context";
import { SnapshotsManagerProvider } from "../../packages/ui/src/contexts/snapshots.context";
import FullScreenLoading from "../../packages/ui/src/common/loaders/FullScreenLoading/FullScreenLoading";

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
};

export const queryClient = new QueryClient();

export const FlowserClientApp = ({
  useHashRouter,
  platformAdapter,
}: FlowserClientAppProps): ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <PlatformAdapterProvider {...platformAdapter}>
          <ConsentAnalytics />
          <FlowserUsageRequirements />
          <RouterProvider router={useHashRouter ? hashRouter : browserRouter} />
          <Toaster
            position="bottom-center"
            gutter={8}
            toastOptions={{
              className: "",
              style: {
                background: "#9BDEFA", // $blue
                color: "#363F53", // $table-line-background
                padding: "12px", // $spacing-base
                maxWidth: "400px",
                maxHeight: "200px",
                textOverflow: "ellipsis",
              },
            }}
          />
        </PlatformAdapterProvider>
      </ConfirmDialogProvider>
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
  const api = useFlowserHooksApi();
  const { data } = api.useGetTransactions();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <TransactionsTable transactions={data} />;
}

function TransactionDetailsPage() {
  const { transactionId } = useParams();

  return <TransactionDetails transactionId={transactionId!} />;
}

function BlocksTablePage() {
  const api = useFlowserHooksApi();
  const { data } = api.useGetBlocks();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <BlocksTable blocks={data} />;
}

function BlockDetailsPage() {
  const { blockId } = useParams();

  return <BlockDetails blockId={blockId!} />;
}

function AccountsTablePage() {
  const api = useFlowserHooksApi();
  const { data } = api.useGetAccounts();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <AccountsTable accounts={data} />;
}

function AccountDetailsPage() {
  const { accountId } = useParams();

  return <AccountDetails accountId={accountId!} />;
}

function ContractsTablePage() {
  const api = useFlowserHooksApi();
  const { data } = api.useGetContracts();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <ContractsTable contracts={data} />;
}

function ContractDetailsPage() {
  const { contractId } = useParams();

  return <ContractDetails contractId={contractId!} />;
}

function EventsTablePage() {
  const api = useFlowserHooksApi();
  const { data } = api.useGetEvents();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <EventsTable events={data} />;
}

function EventDetailsPage() {
  const { eventId } = useParams();

  return <EventDetails eventId={eventId!} />;
}
