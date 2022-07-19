import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import Details from "./details/Details";

const Contracts = () => {
  return (
    <Switch>
      <Route exact path={`/contracts`} component={Main} />
      <Route path={`/contracts/details/:contractId`} component={Details} />
      <Redirect from="*" to={`/contracts`} />
    </Switch>
  );
};

export default Contracts;
