import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Main } from "./main/Main";

export const Project = () => {
  return (
    <Switch>
      <Route exact path={"/project"} component={Main} />
    </Switch>
  );
};
