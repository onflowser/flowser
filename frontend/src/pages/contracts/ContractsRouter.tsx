import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ContractDetails } from "./details/ContractDetails";
import { useGetPollingContracts } from "../../hooks/use-api";
import { ContractsTable } from "./ContractsTable";

export const ContractsRouter = () => {
  return (
    <Switch>
      <Route exact path={`/contracts`} component={ContractsTablePage} />
      <Route
        path={`/contracts/details/:contractId`}
        component={ContractDetails}
      />
      <Redirect from="*" to={`/contracts`} />
    </Switch>
  );
};

function ContractsTablePage() {
  const { data } = useGetPollingContracts();

  return <ContractsTable contracts={data} />;
}
