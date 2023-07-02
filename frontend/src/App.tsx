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
import { RouteWithLayout } from "./components/layout/Layout";
import { routes } from "./constants/routes";
import { UiStateContextProvider } from "./contexts/ui-state.context";
import { useSearch } from "./hooks/use-search";
import "./App.scss";
import { toastOptions } from "./config/toast";

// pages
import Start from "./pages/start/Start";
import Accounts from "./pages/accounts/Accounts";
import Blocks from "./pages/blocks/Blocks";
import Transactions from "./pages/transactions/Transactions";
import Contracts from "./pages/contracts/Contracts";
import Events from "./pages/events/Events";
import { ProjectProvider } from "./contexts/project.context";
import { ConfirmDialogProvider } from "./contexts/confirm-dialog.context";
import { QueryClientProvider } from "react-query";
import { Project } from "./pages/project/Project";
import { ProjectRequirements } from "./components/requirements/ProjectRequirements";
import { TimeoutPollingProvider } from "./contexts/timeout-polling.context";
import {
  PlatformAdapterProvider,
  PlatformAdapterState,
} from "./contexts/platform-adapter.context";
import { queryClient } from "./config/react-query";
import { ConsentDialog } from "./components/consent-dialog/ConsentDialog";
import { useAnalyticsConsent } from "./hooks/use-analytics-consent";
import { ServiceRegistry } from "./services/service-registry";
import { AnalyticEvent } from "./services/analytics.service";
import { Interactions } from "./pages/interactions/Interactions";

const BrowserRouterEvents = withRouter(
  ({
    children,
    history,
    location,
  }: RouteComponentProps & { children: ReactElement[] }) => {
    const { setSearchTerm } = useSearch();
    const { analyticsService } = ServiceRegistry.getInstance();

    useEffect(() => {
      history.listen((location, action) => {
        analyticsService.track(AnalyticEvent.PAGE_VIEW, {
          location,
          action,
        });
        if (action === "PUSH") {
          setSearchTerm("");
        }
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
                  <FlowserRoutes />
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
        <Route path={routes.start} component={Start} />
        <RouteWithLayout path={routes.accounts} component={Accounts} />
        <RouteWithLayout path={routes.blocks} component={Blocks} />
        <RouteWithLayout path={routes.transactions} component={Transactions} />
        <RouteWithLayout path={routes.contracts} component={Contracts} />
        <RouteWithLayout path={routes.events} component={Events} />
        <RouteWithLayout path={routes.interactions} component={Interactions} />
        <RouteWithLayout path={routes.project} component={Project} />
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
  const [consentAnalyticsSetting, setConsentAnalyticsSetting] =
    useAnalyticsConsent();
  const isAlreadySet = consentAnalyticsSetting !== null;
  if (isAlreadySet) {
    return null;
  }
  return (
    <ConsentDialog
      consent={consentAnalyticsSetting ?? true}
      setConsent={setConsentAnalyticsSetting}
    />
  );
}
