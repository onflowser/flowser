import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import Configuration from "./configuration/Configuration";

const Start: FunctionComponent = () => {
  return (
    <div>
      <Switch>
        <Route exact path={`/start`} component={Main} />
        <Route path={`/start/configure/:id?`} component={Configuration} />
        <Redirect from="*" to={`/start`} />
      </Switch>
    </div>
  );
};

export default Start;
