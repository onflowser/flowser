import React, { ReactElement, useEffect } from "react";
import {
  BrowserRouter,
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import { routes } from "./constants/routes";
import { UiStateContextProvider } from "./contexts/ui-state.context";
import { useSearch } from "./hooks/use-search";
import "./App.scss";
import { toastOptions } from "./config/toast";
import splitbee from "@splitbee/web";
import { QueryClientProvider } from "react-query";

// pages
import Start from "./pages/start/Start";
import Accounts from "./pages/accounts/Accounts";
import Blocks from "./pages/blocks/Blocks";
import Transactions from "./pages/transactions/Transactions";
import Contracts from "./pages/contracts/Contracts";
import Events from "./pages/events/Events";
import Logs from "./pages/logs/Logs";
import query from "./config/query";

// init analytics
if (process.env.NODE_ENV !== "development") {
  splitbee.init({
    token: "B3B9T4Z4SRQ3",
    disableCookie: true,
  });
}

const RouteWithLayout = (props: RouteProps) => (
  <Layout>
    <Route {...props} />
  </Layout>
);

const BrowserRouterEvents = withRouter(
  ({
    children,
    history,
    location,
  }: RouteComponentProps & { children: ReactElement[] }) => {
    const { setSearchTerm } = useSearch();

    history.listen((location, action) => {
      if (action === "PUSH") {
        setSearchTerm("");
      }
    });

    useEffect(() => {
      // scroll to the top on every route change
      window.scrollTo(0, 0);
    }, [location]);

    return <>{children}</>;
  }
);

export const FlowserClientApp = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={query}>
        <UiStateContextProvider>
          <BrowserRouter>
            <BrowserRouterEvents>
              <Switch>
                <Route path={`/${routes.start}`} component={Start} />
                <RouteWithLayout
                  path={`/${routes.accounts}`}
                  component={Accounts}
                />
                <RouteWithLayout
                  path={`/${routes.blocks}`}
                  component={Blocks}
                />
                <RouteWithLayout
                  path={`/${routes.transactions}`}
                  component={Transactions}
                />
                <RouteWithLayout
                  path={`/${routes.contracts}`}
                  component={Contracts}
                />
                <RouteWithLayout
                  path={`/${routes.events}`}
                  component={Events}
                />
                <RouteWithLayout path={`/${routes.logs}`} component={Logs} />
                <Redirect from="*" to={`/${routes.start}`} />
              </Switch>
              <Toaster
                position="bottom-center"
                gutter={8}
                toastOptions={toastOptions}
              />
            </BrowserRouterEvents>
          </BrowserRouter>
        </UiStateContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};
