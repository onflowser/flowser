import React, { FunctionComponent, useEffect } from "react";
import { useNavigation } from "../../../hooks/use-navigation";
import { useGetPollingTransactions } from "../../../hooks/use-api";
import { TransactionsTable } from "./TransactionsTable";

const Main: FunctionComponent = () => {
  const { showNavigationDrawer } = useNavigation();
  const { data } = useGetPollingTransactions();

  useEffect(() => {
    showNavigationDrawer(false);
  }, []);

  return <TransactionsTable transactions={data} />;
};

export default Main;
