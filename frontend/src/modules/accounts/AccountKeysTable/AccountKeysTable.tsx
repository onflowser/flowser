import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../contexts/timeout-polling.context";
import { AccountKey } from "@flowser/shared";
import Label from "../../../components/label/Label";
import classes from "../AccountDetails/AccountDetails.module.scss";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import CopyButton from "../../../components/buttons/copy-button/CopyButton";
import classNames from "classnames";
import Badge from "../../../components/badge/Badge";
import { FlowUtils } from "../../../utils/flow-utils";
import React, { ReactElement } from "react";
import Table from "../../../components/table/Table";

const columnsHelper = createColumnHelper<DecoratedPollingEntity<AccountKey>>();

const columns = [
  columnsHelper.accessor("accountAddress", {
    header: () => <Label variant="medium">KEY</Label>,
    cell: (info) => (
      <div className={classes.keysRoot}>
        <div className={classes.row}>
          <MiddleEllipsis className={classes.hash}>
            {info.row.original.publicKey}
          </MiddleEllipsis>
          <CopyButton value={info.row.original.publicKey} />
        </div>
        <div className={classNames(classes.badges, classes.row)}>
          <Badge>WEIGHT: {info.row.original.weight}</Badge>
          <Badge>SEQ. NUMBER: {info.row.original.sequenceNumber}</Badge>
          <Badge>INDEX: {info.row.original.index}</Badge>
          <Badge>
            SIGN CURVE:{" "}
            {FlowUtils.getSignatureAlgoName(info.row.original.signAlgo)}
          </Badge>
          <Badge>
            HASH ALGO.: {FlowUtils.getHashAlgoName(info.row.original.hashAlgo)}
          </Badge>
          <Badge>REVOKED: {info.row.original.revoked ? "YES" : "NO"}</Badge>
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
    <Table<DecoratedPollingEntity<AccountKey>>
      columns={columns}
      data={props.keys}
    />
  );
}
