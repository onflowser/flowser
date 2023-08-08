import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import { useNavigation } from "../../../hooks/use-navigation";
import { useSearch } from "../../../hooks/use-search";
import { useFilterData } from "../../../hooks/use-filter-data";
import { useGetPollingTransactions } from "../../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import { Transaction } from "@flowser/shared";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { NavLink } from "react-router-dom";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import Table from "../../../components/table/Table";
import { ExecutionStatus } from "components/status/ExecutionStatus";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { AccountLink } from "../../../components/account/link/AccountLink";

// TRANSACTIONS TABLE
const columnHelper = createColumnHelper<DecoratedPollingEntity<Transaction>>();

export const transactionTableColumns = [
  columnHelper.accessor("id", {
    header: () => <Label variant="medium">ID</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/transactions/details/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hash}>
            {info.getValue()}
          </MiddleEllipsis>
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("blockId", {
    header: () => <Label variant="medium">BLOCK ID</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/blocks/details/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hash}>
            {info.getValue()}
          </MiddleEllipsis>
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("payer", {
    header: () => <Label variant="medium">PAYER</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.accessor("status.executionStatus", {
    header: () => <Label variant="medium">EXECUTION</Label>,
    cell: (info) => (
      <div>
        <ExecutionStatus status={info.row.original.status} />
      </div>
    ),
  }),
  columnHelper.accessor("status.grcpStatus", {
    header: () => <Label variant="medium">API</Label>,
    cell: (info) => (
      <div>
        <GrcpStatus status={info.row.original.status} />
      </div>
    ),
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
  const { data, firstFetch, error } = useGetPollingTransactions();
  const { filteredData } = useFilterData(data, searchTerm);

  useEffect(() => {
    setPlaceholder("Search transactions");
    showNavigationDrawer(false);
  }, []);

  return (
    <Table<DecoratedPollingEntity<Transaction>>
      isInitialLoading={firstFetch}
      error={error}
      data={filteredData}
      columns={transactionTableColumns}
    />
  );
};

export default Main;
