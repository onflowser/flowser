import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { AccountsTable } from "./AccountsTable";
import { AccountDetails } from "./details/Details";

export const AccountsRouter: FC = () => {
  return (
    <Switch>
      <Route exact path={`/accounts`} component={AccountsTable} />
      <Route path={`/accounts/details/:accountId`} component={AccountDetails} />
      <Redirect from="*" to={`/accounts`} />
    </Switch>
  );
};
