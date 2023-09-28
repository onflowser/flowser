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
        <KeyDisplay label="Public" keyValue={info.row.original.publicKey} />
        {info.row.original.privateKey && (
          <KeyDisplay label="Private" keyValue={info.row.original.privateKey} />
        )}
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

function KeyDisplay(props: { label: string; keyValue: string }) {
  return (
    <div className={classes.keyWrapper}>
      <b>{props.label}:</b>
      <MiddleEllipsis maxLength={100}>{props.keyValue}</MiddleEllipsis>
      <CopyButton value={props.keyValue} />
    </div>
  );
}

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
