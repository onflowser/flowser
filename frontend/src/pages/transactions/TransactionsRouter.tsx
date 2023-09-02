import React, { FunctionComponent } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { TransactionDetails } from "./details/TransactionDetails";
import { useGetPollingTransactions } from "../../hooks/use-api";
import { TransactionsTable } from "./main/TransactionsTable";

export const TransactionsRouter = () => {
  return (
    <Switch>
      <Route exact path={`/transactions`} component={TransactionsTablePage} />
      <Route
        path={`/transactions/details/:transactionId`}
        component={TransactionDetails}
      />
      <Redirect from="*" to={`/transactions`} />
    </Switch>
  );
};

const TransactionsTablePage: FunctionComponent = () => {
  const { data } = useGetPollingTransactions();

  return <TransactionsTable transactions={data} />;
};
