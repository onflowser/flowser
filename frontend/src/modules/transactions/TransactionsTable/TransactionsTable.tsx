import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../contexts/timeout-polling.context";
import { Transaction } from "@flowser/shared";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import classes from "./TransactionsTable.module.scss";
import { AccountLink } from "../../accounts/AccountLink/AccountLink";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import ReactTimeago from "react-timeago";
import React, { ReactElement } from "react";
import Table from "../../../components/table/Table";
import { useTransactionName } from "../../interactions/hooks/use-transaction-name";
import { Ellipsis } from "../../../components/ellipsis/Ellipsis";
import { ProjectLink } from "../../../components/links/ProjectLink";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Transaction>>();

const columns = [
  columnHelper.accessor("id", {
    header: () => <Label variant="medium">IDENTIFIER</Label>,
    cell: (info) => (
      <Value>
        <ProjectLink to={`/transactions/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hash}>
            {info.getValue()}
          </MiddleEllipsis>
        </ProjectLink>
      </Value>
    ),
  }),
  columnHelper.display({
    id: "description",
    header: () => <Label variant="medium">DESCRIPTION</Label>,
    meta: {
      className: classes.nameColumn,
    },
    cell: (info) => (
      <Value style={{ width: "100%" }}>
        <TransactionName transaction={info.row.original} />
      </Value>
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
  columnHelper.accessor("proposalKey.address", {
    header: () => <Label variant="medium">PROPOSER</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
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
  return <Ellipsis>{name}</Ellipsis>;
}
