import React, { FunctionComponent } from "react";
import { Redirect, Route, RouteProps, Switch } from "react-router-dom";
import Main from "./main/Main";
import Configuration from "./configuration/Configuration";
import Layout from "components/layout/Layout";
import { RouteWithLayout } from "components/layout/Layout";

const Start: FunctionComponent = () => {
  return (
    <div>
      <Switch>
        <Route exact path={`/start`} component={Main} />
        <Route
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
    </div>
  );
};

export default Start;
