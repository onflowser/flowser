import React, { ReactElement } from "react";
import { TransactionStatus } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";

export type ExecutionStatusProps = {
  status: TransactionStatus | undefined;
};

export function ExecutionStatus({
  status,
}: ExecutionStatusProps): ReactElement {
  const { executionStatus } = status ?? {};
  const icon = FlowUtils.getExecutionStatusIcon(executionStatus);
  const statusName = FlowUtils.getExecutionStatusName(executionStatus);
  return (
    <div className={classes.root}>
      {icon}
      <span className={classes.statusLabel}>{statusName}</span>
    </div>
  );
}
