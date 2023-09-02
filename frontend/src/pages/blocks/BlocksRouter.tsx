import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { BlocksTable } from "./BlocksTable/BlocksTable";
import { BlockDetails } from "./details/Details";

export const BlocksRouter = () => {
  return (
    <Switch>
      <Route exact path={`/blocks`} component={BlocksTable} />
      <Route path={`/blocks/details/:blockId`} component={BlockDetails} />
      <Redirect from="*" to={`/blocks`} />
    </Switch>
  );
};
