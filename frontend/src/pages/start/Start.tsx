import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import { Configuration } from "./configuration/Configuration";

const Start: FunctionComponent = () => {
  return (
    <Switch>
      <Route exact path={`/start`} component={Main} />
      <Route path={`/start/configure/:id?`} component={Configuration} />
      <Redirect from="*" to={`/start`} />
    </Switch>
  );
};

export default Start;
