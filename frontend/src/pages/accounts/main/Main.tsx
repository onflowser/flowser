import React, { FunctionComponent, useEffect } from "react";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { useNavigation } from "../../../hooks/use-navigation";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../../hooks/use-search";
import { useFilterData } from "../../../hooks/use-filter-data";
import { useGetPollingAccounts } from "../../../hooks/use-api";
import Table from "../../../components/table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { Account } from "@flowser/shared";
import { TextUtils } from "../../../utils/text-utils";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import classes from "./Main.module.scss";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Account>>();

// ACCOUNTS TABLE
const columns = [
  columnHelper.accessor("address", {
    header: () => <Label variant="medium">ADDRESS</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("balance", {
    header: () => <Label variant="medium">BALANCE</Label>,
    cell: (info) => (
      <Value>{TextUtils.readableNumber(info.getValue())} FLOW</Value>
    ),
  }),
  columnHelper.accessor("keys", {
    header: () => <Label variant="medium">KEY COUNT</Label>,
    cell: (info) => <Value>{info.getValue().length ?? 0}</Value>,
  }),
  columnHelper.accessor("transactions", {
    header: () => <Label variant="medium">TX COUNT</Label>,
    cell: (info) => <Value>{info.getValue().length ?? 0}</Value>,
  }),
  columnHelper.accessor("createdAt", {
    header: () => <Label variant="medium">CREATED</Label>,
    cell: (info) => (
      <Value>
        <ReactTimeago date={info.getValue()} />
      </Value>
    ),
  }),
];

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder } = useSearch();
  const { showNavigationDrawer } = useNavigation();
  const { data: accounts, firstFetch } = useGetPollingAccounts();

  useEffect(() => {
    setPlaceholder("Search accounts");
    showNavigationDrawer(false);
  }, []);

  const { filteredData } = useFilterData(accounts, searchTerm);

  return (
    <Table<DecoratedPollingEntity<Account>>
      isInitialLoading={firstFetch}
      columns={columns}
      data={filteredData}
      bodyRowClass={(row) =>
        row.original.isDefaultAccount ? classes.defaultAccountRow : ""
      }
    />
  );
};

export default Main;
