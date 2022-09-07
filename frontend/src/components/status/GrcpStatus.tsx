import React, { ReactElement } from "react";
import { TransactionStatus } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";

export type GrcpStatusProps = {
  status: TransactionStatus | undefined;
};

export function GrcpStatus({ status }: GrcpStatusProps): ReactElement {
  const { grcpStatus } = status ?? {};
  const icon = FlowUtils.getGrcpStatusIcon(grcpStatus);
  const statusName = FlowUtils.getGrcpStatusName(grcpStatus);
  return (
    <div className={classes.root}>
      {icon}
      <span className={classes.statusLabel}>{statusName}</span>
    </div>
  );
}
