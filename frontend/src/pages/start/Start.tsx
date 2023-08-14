import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import { Configuration } from "./configuration/Configuration";
import { RouteWithBackButton, RouteWithLayout } from "components/layout/Layout";
import { routes } from "../../constants/routes";

const Start: FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path={routes.start} component={Main} />
      <RouteWithBackButton
        path={routes.configure}
        exact={true}
        component={Configuration}
      />
      <RouteWithBackButton
        path={routes.configureExisting}
        component={Configuration}
      />
      <Redirect from="*" to={routes.start} />
    </Switch>
  );
};

export default Start;
