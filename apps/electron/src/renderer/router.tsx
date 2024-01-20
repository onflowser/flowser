import React, { ReactElement, ReactNode, useEffect } from 'react';
import {
  createHashRouter,
  Navigate,
  Outlet,
  RouteObject,
  RouterProvider,
  useLocation,
  useMatches,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { WorkspaceLayout } from '@onflowser/ui/src/common/layouts/ProjectLayout/WorkspaceLayout';
import { WorkspaceManagerProvider } from '@onflowser/ui/src/contexts/workspace.context';
import { InteractionsPage } from '@onflowser/ui/src/interactions/InteractionsPage';
import { InteractionRegistryProvider } from '@onflowser/ui/src/interactions/contexts/interaction-registry.context';
import { TransactionsTable } from '@onflowser/ui/src/transactions/TransactionsTable/TransactionsTable';
import { TransactionDetails } from '@onflowser/ui/src/transactions/TransactionDetails/TransactionDetails';
import { BlockDetails } from '@onflowser/ui/src/blocks/BlockDetails/BlockDetails';
import { BlocksTable } from '@onflowser/ui/src/blocks/BlocksTable/BlocksTable';
import { AccountDetails } from '@onflowser/ui/src/accounts/AccountDetails/AccountDetails';
import { AccountsTable } from '@onflowser/ui/src/accounts/AccountsTable/AccountsTable';
import { ContractsTable } from '@onflowser/ui/src/contracts/ContractsTable/ContractsTable';
import { ContractDetails } from '@onflowser/ui/src/contracts/ContractDetails/ContractDetails';
import { EventsTable } from '@onflowser/ui/src/events/EventsTable/EventsTable';
import { createCrumbHandle } from '@onflowser/ui/src/common/misc/Breadcrumbs/Breadcrumbs';
import { TemplatesRegistryProvider } from '@onflowser/ui/src/interactions/contexts/templates.context';
import { BasicLayout } from '@onflowser/ui/src/common/layouts/BasicLayout/BasicLayout';
import { EventDetails } from '@onflowser/ui/src/events/EventDetails/EventDetails';
import { SnapshotsManagerProvider } from '@onflowser/ui/src/contexts/snapshots.context';
import FullScreenLoading from '@onflowser/ui/src/common/loaders/FullScreenLoading/FullScreenLoading';
import { useServiceRegistry } from '@onflowser/ui/src/contexts/service-registry.context';
import {
  AnalyticEvent,
  useAnalytics,
} from '@onflowser/ui/src/hooks/use-analytics';
import './App.scss';
import {
  useGetAccounts,
  useGetBlocks,
  useGetContract,
  useGetContracts,
  useGetEvents,
  useGetTransactions,
} from '@onflowser/ui/src/api';
import { WorkspaceList } from '@onflowser/ui/src/workspaces/WorkspaceList/WorkspaceList';
import { WorkspaceSettings } from '@onflowser/ui/src/workspaces/WorkspaceSettings/WorkspaceSettings';
import { NavigationProvider } from '@onflowser/ui/src/contexts/navigation.context';
import { ConsentDialog } from '@onflowser/ui/src/common/overlays/dialogs/consent/ConsentDialog';

function BrowserRouterEvents(props: { children: ReactNode }): ReactElement {
  const location = useLocation();
  const { analyticsService } = useServiceRegistry();

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
}

function ProjectSettingsPage() {
  const { workspaceId } = useParams();

  return <WorkspaceSettings workspaceId={workspaceId!} />;
}

function TransactionsTablePage() {
  const { data } = useGetTransactions();

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
  const { data } = useGetBlocks();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <BlocksTable blocks={data} />;
}

function BlockDetailsPage() {
  const { blockId } = useParams();

  return <BlockDetails blockId={blockId!} />;
}

export function AccountsTablePage() {
  const { data } = useGetAccounts();

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
  const { data } = useGetContracts();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <ContractsTable contracts={data} />;
}

function ContractDetailsPage() {
  const { contractId } = useParams();
  const { data } = useGetContract(contractId!);

  if (!data) {
    return <FullScreenLoading />;
  }

  return <ContractDetails contract={data} />;
}

function EventsTablePage() {
  const { data } = useGetEvents();

  if (!data) {
    return <FullScreenLoading />;
  }

  return <EventsTable events={data} />;
}

function EventDetailsPage() {
  const { eventId } = useParams();

  return <EventDetails eventId={eventId!} />;
}

const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="projects" replace />,
  },
  {
    path: 'projects',
    element: (
      <ReactRouterNavigationProvider>
        <WorkspaceManagerProvider>
          <SnapshotsManagerProvider>
            <BrowserRouterEvents>
              <Outlet />
              <ConsentAnalytics />
            </BrowserRouterEvents>
          </SnapshotsManagerProvider>
        </WorkspaceManagerProvider>
      </ReactRouterNavigationProvider>
    ),
    handle: createCrumbHandle({
      crumbName: 'Projects',
    }),
    children: [
      {
        index: true,
        element: <WorkspaceList />,
      },
      {
        path: 'create',
        element: (
          <BasicLayout>
            <ProjectSettingsPage />
          </BasicLayout>
        ),
        handle: createCrumbHandle({
          crumbName: 'Create',
        }),
      },
      {
        path: ':workspaceId',
        element: (
          <WorkspaceLayout>
            <InteractionRegistryProvider>
              <TemplatesRegistryProvider>
                <Outlet />
              </TemplatesRegistryProvider>
            </InteractionRegistryProvider>
          </WorkspaceLayout>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="interactions" replace />,
          },
          {
            path: 'settings',
            element: <ProjectSettingsPage />,
          },
          {
            path: 'accounts',
            handle: createCrumbHandle({
              crumbName: 'Accounts',
            }),
            children: [
              {
                index: true,
                element: <AccountsTablePage />,
              },
              {
                path: ':accountId',
                element: <AccountDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: 'Details',
                }),
              },
            ],
          },
          {
            path: 'blocks',
            handle: createCrumbHandle({
              crumbName: 'Blocks',
            }),
            children: [
              {
                index: true,
                element: <BlocksTablePage />,
              },
              {
                path: ':blockId',
                element: <BlockDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: 'Details',
                }),
              },
            ],
          },
          {
            path: 'transactions',
            handle: createCrumbHandle({
              crumbName: 'Transactions',
            }),
            children: [
              {
                index: true,
                element: <TransactionsTablePage />,
              },
              {
                path: ':transactionId',
                element: <TransactionDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: 'Details',
                }),
              },
            ],
          },
          {
            path: 'contracts',
            handle: createCrumbHandle({
              crumbName: 'Contracts',
            }),
            children: [
              {
                index: true,
                element: <ContractsTablePage />,
              },
              {
                path: ':contractId',
                element: <ContractDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: 'Details',
                }),
              },
            ],
          },
          {
            path: 'events',
            handle: createCrumbHandle({
              crumbName: 'Events',
            }),
            children: [
              {
                index: true,
                element: <EventsTablePage />,
              },
              {
                path: ':eventId',
                element: <EventDetailsPage />,
                handle: createCrumbHandle({
                  crumbName: 'Details',
                }),
              },
            ],
          },
          {
            path: 'interactions',
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

const hashRouter = createHashRouter(routes);

export function FlowserRouter(): ReactElement {
  return <RouterProvider router={hashRouter} />;
}

function ReactRouterNavigationProvider(props: { children: ReactNode }) {
  const matches = useMatches();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <NavigationProvider
      controller={{
        matches,
        location: {
          hash: location.hash,
          search: new URLSearchParams(location.search),
          pathname: location.pathname,
        },
        navigate,
        params,
      }}
    >
      {props.children}
    </NavigationProvider>
  );
}

function ConsentAnalytics() {
  const { isConsented, setIsConsented } = useAnalytics();
  if (isConsented !== undefined) {
    return null;
  }
  return (
    <ConsentDialog consent={isConsented ?? true} setConsent={setIsConsented} />
  );
}
