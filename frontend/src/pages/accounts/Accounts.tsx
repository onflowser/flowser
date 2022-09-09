import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import Details from "./details/Details";

const Accounts: FC = () => {
  return (
    <Switch>
      <Route exact path={`/accounts`} component={Main} />
      <Route path={`/accounts/details/:accountId`} component={Details} />
      <Redirect from="*" to={`/accounts`} />
    </Switch>
  );
};

export default Accounts;
