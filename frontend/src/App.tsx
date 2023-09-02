import React, { ReactElement, useEffect } from "react";
import {
  BrowserRouter,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { RouteWithProjectLayout } from "./components/layout/Layout";
import { routes } from "./constants/routes";
import { UiStateContextProvider } from "./contexts/ui-state.context";
import "./App.scss";
import { toastOptions } from "./config/toast";

// pages
import { StartRouter } from "./pages/start/StartRouter";
import { AccountsRouter } from "./pages/accounts/AccountsRouter";
import { BlocksRouter } from "./pages/blocks/BlocksRouter";
import { TransactionsRouter } from "./pages/transactions/TransactionsRouter";
import { ContractsRouter } from "./pages/contracts/ContractsRouter";
import { EventsRouter } from "./pages/events/EventsRouter";
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
import { InteractionsPage } from "./pages/interactions/InteractionsPage";
import { InteractionRegistryProvider } from "pages/interactions/contexts/interaction-registry.context";
import { Configuration } from "./pages/start/configuration/Configuration";

const BrowserRouterEvents = withRouter(
  ({
    children,
    history,
    location,
  }: RouteComponentProps & { children: ReactElement[] }) => {
    const { analyticsService } = ServiceRegistry.getInstance();

    useEffect(() => {
      history.listen((location, action) => {
        analyticsService.track(AnalyticEvent.PAGE_VIEW, {
          location,
          action,
        });
      });
    }, []);

    useEffect(() => {
      // scroll to the top on every route change
      window.scrollTo(0, 0);
    }, [location]);

    return <>{children}</>;
  }
);

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
      <Switch>
        <Route path={routes.start} component={StartRouter} />
        <RouteWithProjectLayout
          path={routes.accounts}
          component={AccountsRouter}
        />
        <RouteWithProjectLayout path={routes.blocks} component={BlocksRouter} />
        <RouteWithProjectLayout
          path={routes.transactions}
          component={TransactionsRouter}
        />
        <RouteWithProjectLayout
          path={routes.contracts}
          component={ContractsRouter}
        />
        <RouteWithProjectLayout path={routes.events} component={EventsRouter} />
        <RouteWithProjectLayout
          path={routes.interactions}
          component={InteractionsPage}
        />
        <RouteWithProjectLayout
          path={routes.configureCurrent}
          component={Configuration}
        />
        <Redirect from="*" to={routes.start} />
      </Switch>
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
