import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { useNavigation } from "../../../hooks/use-navigation";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../../hooks/use-search";
import { useFilterData } from "../../../hooks/use-filter-data";
import NoResults from "../../../components/no-results/NoResults";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetPollingAccounts } from "../../../hooks/use-api";
import Table from "../../../components/table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { Account } from "@flowser/types/generated/entities/accounts";

type FilteredData = {
  address: string;
  balance: number;
  code: string;
  contracts: [];
  createdAt: string;
  isNew: boolean;
  isUpdated: boolean;
  keys: [];
  storage: [];
  transactions: [];
  updatedAt: string;
};

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data: accounts, firstFetch } = useGetPollingAccounts();

  useEffect(() => {
    setPlaceholder("search for block numbers or tx hashes");
    showNavigationDrawer(false);
    showSubNavigation(true);
  }, []);

  useEffect(() => {
    disableSearchBar(!accounts.length);
  }, [accounts]);

  const { filteredData } = useFilterData(accounts, searchTerm);

  const columnHelper = createColumnHelper<FilteredData>();

  // Specify table shape
  const columns = [
    columnHelper.accessor("address", {
      header: () => <Label>ADDRESS</Label>,
      cell: (info) => (
        <Value>
          <NavLink to={`accounts/details/${info.getValue()}`}>
            {info.getValue()}
          </NavLink>
        </Value>
      ),
    }),
    columnHelper.accessor("balance", {
      header: () => <Label>BALANCE</Label>,
      cell: (info) => <Value>{info.getValue()} FLOW</Value>,
    }),
    columnHelper.accessor("keys", {
      header: () => <Label>KEY COUNT</Label>,
      cell: (info) => <Value>{info.getValue().length ?? 0}</Value>,
    }),
    columnHelper.accessor("transactions", {
      header: () => <Label>TX COUNT</Label>,
      cell: (info) => <Value>{info.getValue().length ?? 0}</Value>,
    }),
  ];

  return (
    <>
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
      {filteredData.length > 0 && (
        // @ts-ignore TODO: fix types for columns
        <Table<Account> columns={columns} data={[...filteredData]}></Table>
      )}
    </>
  );
};

export default Main;
