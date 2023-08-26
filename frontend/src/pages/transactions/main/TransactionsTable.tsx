import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../contexts/timeout-polling.context";
import { Transaction } from "@flowser/shared";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { NavLink } from "react-router-dom";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import classes from "./TransactionsTable.module.scss";
import { AccountLink } from "../../../components/account/link/AccountLink";
import { ExecutionStatus } from "../../../components/status/ExecutionStatus";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import ReactTimeago from "react-timeago";
import React, { ReactElement } from "react";
import Table from "../../../components/table/Table";
import { useTransactionName } from "../../interactions/hooks/use-transaction-name";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Transaction>>();

const columns = [
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
  columnHelper.accessor("payer", {
    header: () => <Label variant="medium">PAYER</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.display({
    id: "name",
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <TransactionName transaction={info.row.original} />
      </Value>
    ),
  }),
  columnHelper.accessor("status.executionStatus", {
    header: () => <Label variant="medium">STATUS</Label>,
    cell: (info) => (
      <div>
        <ExecutionStatus status={info.row.original.status} />
      </div>
    ),
  }),
  columnHelper.accessor("status.grcpStatus", {
    header: () => <Label variant="medium">EXECUTION</Label>,
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

type TransactionsTableProps = {
  transactions: DecoratedPollingEntity<Transaction>[];
};

export function TransactionsTable(props: TransactionsTableProps): ReactElement {
  return (
    <Table<DecoratedPollingEntity<Transaction>>
      data={props.transactions}
      columns={columns}
    />
  );
}

function TransactionName(props: { transaction: Transaction }) {
  const name = useTransactionName({
    transaction: props.transaction,
  });
  return <span>{name}</span>;
}
