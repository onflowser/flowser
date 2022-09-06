import React, { ReactElement } from "react";
import { TransactionStatus } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";

export type GrcpStatusProps = {
  status: TransactionStatus | undefined;
};

export function GrcpStatus({ status }: GrcpStatusProps): ReactElement {
  const executionStatusCode = status?.status;
  const icon = FlowUtils.getExecutionStatusIcon(executionStatusCode);
  const statusName = FlowUtils.getExecutionStatusName(executionStatusCode);
  return (
    <div className={classes.root}>
      {icon}
      <span className={classes.statusLabel}>{statusName}</span>
    </div>
  );
}
