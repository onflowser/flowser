import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import { Configuration } from "./configuration/Configuration";
import { RouteWithBackButton, RouteWithLayout } from "components/layout/Layout";

const Start: FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path={`/start`} component={Main} />
      <RouteWithBackButton
        path={`/start/configure`}
        exact={true}
        component={Configuration}
      />
      <RouteWithLayout
        path={`/start/configure/:id?`}
        component={Configuration}
      />
      <Redirect from="*" to={`/start`} />
    </Switch>
  );
};

export default Start;
