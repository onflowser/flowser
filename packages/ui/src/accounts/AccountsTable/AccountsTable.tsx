import React, { FunctionComponent } from "react";
import Label from "../../common/misc/Label/Label";
import Value from "../../common/misc/Value/Value";
import { BaseTable } from "../../common/misc/BaseTable/BaseTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Account } from "@flowser/shared";
import { TextUtils } from "../../utils/text-utils";
import { DecoratedPollingEntity } from "frontend/src/contexts/timeout-polling.context";
import { AccountLink } from "../AccountLink/AccountLink";
import { BaseBadge } from "../../common/misc/BaseBadge/BaseBadge";
import classes from "./AccountsTable.module.scss";
import { Tooltip } from "../../common/overlays/Tooltip/Tooltip";
import { TimeAgo } from "../../common/time/TimeAgo/TimeAgo";

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
    header: () => "",
    cell: (info) => (
      <Value className={classes.tagsColumn}>
        {info.getValue().map((tag) => (
          <Tooltip
            key={tag.name}
            content={tag.description}
            position="right center"
          >
            <BaseBadge className={classes.tag}>{tag.name}</BaseBadge>
          </Tooltip>
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
        <TimeAgo date={info.getValue()} />
      </Value>
    ),
  }),
];

type AccountsTableProps = {
  accounts: DecoratedPollingEntity<Account>[];
};

export const AccountsTable: FunctionComponent<AccountsTableProps> = (props) => {
  return (
    <BaseTable<DecoratedPollingEntity<Account>>
      columns={columns}
      data={props.accounts}
    />
  );
};
