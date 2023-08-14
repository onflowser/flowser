import React, { FunctionComponent, useEffect } from "react";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { useNavigation } from "../../../hooks/use-navigation";
import { NavLink } from "react-router-dom";
import { useGetPollingContracts } from "../../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import Table from "../../../components/table/Table";
import { AccountContract } from "@flowser/shared";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import ReactTimeago from "react-timeago";
import { AccountLink } from "../../../components/account/link/AccountLink";

// CONTRACTS TABLE
const columnHelper =
  createColumnHelper<DecoratedPollingEntity<AccountContract>>();

const columns = [
  columnHelper.accessor("name", {
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/contracts/details/${info.row.original.id}`}>
          {info.row.original.name}
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("accountAddress", {
    header: () => <Label variant="medium">ACCOUNT</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.accessor("updatedAt", {
    header: () => <Label variant="medium">UPDATED</Label>,
    cell: (info) => (
      <Value>
        <ReactTimeago date={info.getValue()} />
      </Value>
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
  const { showNavigationDrawer } = useNavigation();
  const { data, firstFetch, error } = useGetPollingContracts();

  useEffect(() => {
    showNavigationDrawer(false);
  }, []);

  return (
    <Table<DecoratedPollingEntity<AccountContract>>
      isInitialLoading={firstFetch}
      error={error}
      columns={columns}
      data={data}
    />
  );
};

export default Main;
