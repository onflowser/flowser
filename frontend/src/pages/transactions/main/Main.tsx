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
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import Table from "../../../components/table/Table";
import { ExecutionStatus } from "components/status/ExecutionStatus";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";

// TRANSACTIONS TABLE
const columnHelper = createColumnHelper<DecoratedPollingEntity<Transaction>>();

const columns = [
  columnHelper.accessor("id", {
    header: () => <Label variant="medium">ID</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/transactions/details/${info.getValue()}`}>
          <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("blockId", {
    header: () => <Label variant="medium">BLOCK ID</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/blocks/details/${info.getValue()}`}>
          <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("payer", {
    header: () => <Label variant="medium">PAYER</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
        </NavLink>
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
    header: () => <Label variant="medium">GRCP</Label>,
    cell: (info) => (
      <div>
        <GrcpStatus status={info.row.original.status} />
      </div>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: () => <Label variant="medium">TIME</Label>,
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
  const { data, firstFetch } = useGetPollingTransactions();
  const { filteredData } = useFilterData(data, searchTerm);

  useEffect(() => {
    setPlaceholder("Search transactions");
    showNavigationDrawer(false);
  }, []);

  return (
    <Table<DecoratedPollingEntity<Transaction>>
      isInitialLoading={firstFetch}
      data={filteredData}
      columns={columns}
    />
  );
};

export default Main;
