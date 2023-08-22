import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../contexts/timeout-polling.context";
import { AccountContract } from "@flowser/shared";
import Label from "@flowser/uimisc/Label/Label";
import Value from "@flowser/uimisc/Value/Value";
import { NavLink } from "react-router-dom";
import { AccountLink } from "@flowser/ui/account/link/AccountLink";
import ReactTimeago from "react-timeago";
import React, { ReactElement } from "react";
import Table from "../../../components/table/Table";
import { TimeAgo } from "@flowser/uimisc/TimeAgo/TimeAgo";

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
        <TimeAgo date={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: () => <Label variant="medium">CREATED</Label>,
    cell: (info) => (
      <Value>
        <TimeAgo date={info.getValue()} />
      </Value>
    ),
  }),
];

type ContractsTableProps = {
  contracts: DecoratedPollingEntity<AccountContract>[];
};

export function ContractsTable(props: ContractsTableProps): ReactElement {
  return (
    <Table<DecoratedPollingEntity<AccountContract>>
      columns={columns}
      data={props.contracts}
    />
  );
}
