import React, { FunctionComponent, useEffect } from "react";
import { useNavigation } from "../../../hooks/use-navigation";
import { useGetPollingContracts } from "../../../hooks/use-api";
import { ContractsTable } from "./ContractsTable";

const Main: FunctionComponent = () => {
  const { showNavigationDrawer } = useNavigation();
  const { data } = useGetPollingContracts();

  useEffect(() => {
    showNavigationDrawer(false);
  }, []);

  return <ContractsTable contracts={data} />;
};

export default Main;
