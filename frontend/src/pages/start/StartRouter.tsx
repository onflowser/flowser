import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ProjectListPage } from "./ProjectListPage/ProjectListPage";
import { Configuration } from "./configuration/Configuration";
import { RouteWithBackButton } from "components/layout/Layout";
import { routes } from "../../constants/routes";

export const StartRouter: FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path={routes.start} component={ProjectListPage} />
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
