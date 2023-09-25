import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../contexts/timeout-polling.context";
import { AccountKey } from "@flowser/shared";
import Label from "../../../components/misc/Label/Label";
import classes from "./AccountKeysTable.module.scss";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import CopyButton from "../../../components/buttons/CopyButton/CopyButton";
import { BaseBadge } from "../../../components/misc/BaseBadge/BaseBadge";
import { FlowUtils } from "../../../utils/flow-utils";
import React, { ReactElement } from "react";
import { BaseTable } from "../../../components/misc/BaseTable/BaseTable";

const columnsHelper = createColumnHelper<DecoratedPollingEntity<AccountKey>>();

const columns = [
  columnsHelper.accessor("accountAddress", {
    header: () => <Label variant="medium">KEY</Label>,
    cell: (info) => (
      <div className={classes.cellRoot}>
        <div className={classes.keyWrapper}>
          <MiddleEllipsis maxLength={100}>
            {info.row.original.publicKey}
          </MiddleEllipsis>
          <CopyButton value={info.row.original.publicKey} />
        </div>
        <div className={classes.badges}>
          <BaseBadge>WEIGHT: {info.row.original.weight}</BaseBadge>
          <BaseBadge>SEQ. NUMBER: {info.row.original.sequenceNumber}</BaseBadge>
          <BaseBadge>INDEX: {info.row.original.index}</BaseBadge>
          <BaseBadge>
            SIGN CURVE:{" "}
            {FlowUtils.getSignatureAlgoName(info.row.original.signAlgo)}
          </BaseBadge>
          <BaseBadge>
            HASH ALGO.: {FlowUtils.getHashAlgoName(info.row.original.hashAlgo)}
          </BaseBadge>
          <BaseBadge>
            REVOKED: {info.row.original.revoked ? "YES" : "NO"}
          </BaseBadge>
        </div>
      </div>
    ),
  }),
];

type KeysTableProps = {
  keys: DecoratedPollingEntity<AccountKey>[];
};

export function AccountKeysTable(props: KeysTableProps): ReactElement {
  return (
    <BaseTable<DecoratedPollingEntity<AccountKey>>
      columns={columns}
      data={props.keys}
    />
  );
}
