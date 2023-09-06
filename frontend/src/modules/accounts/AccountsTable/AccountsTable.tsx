import React, { FunctionComponent } from "react";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import Table from "../../../components/table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { Account } from "@flowser/shared";
import { TextUtils } from "../../../utils/text-utils";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { AccountLink } from "../AccountLink/AccountLink";
import { Badge } from "../../../components/badge/Badge";
import classes from "./AccountsTable.module.scss";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Account>>();

const columns = [
  columnHelper.accessor("address", {
    header: () => <Label variant="medium">ADDRESS</Label>,
    cell: (info) => (
      <Value>
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  columnHelper.accessor("tags", {
    header: () => <Label variant="medium">TAGS</Label>,
    cell: (info) => (
      <Value className={classes.tagsColumn}>
        {info.getValue().map((tag) => (
          <Badge key={tag.name} className={classes.tag}>
            {tag.name}
          </Badge>
        ))}
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

type AccountsTableProps = {
  accounts: DecoratedPollingEntity<Account>[];
};

export const AccountsTable: FunctionComponent<AccountsTableProps> = (props) => {
  return (
    <Table<DecoratedPollingEntity<Account>>
      columns={columns}
      data={props.accounts}
    />
  );
};
