import React, { useEffect } from "react";
import {
  BrowserRouter,
  Redirect,
  Route,
  RouteProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./core/components/layout/Layout";
import { routes } from "./shared/constants/routes";
import { UiStateContextProvider } from "./shared/contexts/ui-state.context";
import { useSearch } from "./shared/hooks/search";
import "./App.scss";
import { toastOptions } from "./shared/config/toast";

// TODO: remove bellow example
import { FirstFlowserEnum } from "@flowser/types";
const hello: FirstFlowserEnum = FirstFlowserEnum.FIRST_FLOWSER_ENUM_THIRD;
console.log(hello);

// pages
import Start from "./pages/start/Start";
import Accounts from "./pages/accounts/Accounts";
import Blocks from "./pages/blocks/Blocks";
import Transactions from "./pages/transactions/Transactions";
import Contracts from "./pages/contracts/Contracts";
import Events from "./pages/events/Events";
import Logs from "./pages/logs/Logs";

const RouteWithLayout = (props: RouteProps) => (
  <Layout>
    <Route {...props} />
  </Layout>
);

const BrowserRouterEvents = withRouter(({ children, history, location }) => {
  const { setSearchTerm } = useSearch();

  history.listen((location: any, action: any) => {
    if (action === "PUSH") {
      setSearchTerm("");
    }
  });

  useEffect(() => {
    // scroll to the top on every route change
    window.scrollTo(0, 0);
  }, [location]);

  return <>{children}</>;
});

export const App = () => {
  return (
    <UiStateContextProvider>
      <BrowserRouter>
        <BrowserRouterEvents>
          <Switch>
            <Route path={`/${routes.start}`} component={Start} />
            <RouteWithLayout
              path={`/${routes.accounts}`}
              component={Accounts}
            />
            <RouteWithLayout path={`/${routes.blocks}`} component={Blocks} />
            <RouteWithLayout
              path={`/${routes.transactions}`}
              component={Transactions}
            />
            <RouteWithLayout
              path={`/${routes.contracts}`}
              component={Contracts}
            />
            <RouteWithLayout path={`/${routes.events}`} component={Events} />
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
  );
};

export default App;
