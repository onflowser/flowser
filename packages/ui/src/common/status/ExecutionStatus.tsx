import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";
import { ReactComponent as ExpiredIcon } from "../icons/assets/circle-cross.svg";
import { ReactComponent as SealedIcon } from "../icons/assets/circle-check.svg";
import { ReactComponent as UnknownIcon } from "../icons/assets/circle-question-mark.svg";
import { ReactComponent as PendingIcon } from "../icons/assets/pending-tx-icon.svg";
import { ReactComponent as FinalizedIcon } from "../icons/assets/finalised-tx-icon.svg";
import { ReactComponent as ExecutedIcon } from "../icons/assets/executed-tx-icon.svg";
import { ExecutionStatusCode, TransactionStatus } from "@onflowser/api";

export type ExecutionStatusProps = {
  status: TransactionStatus | undefined;
};

export function ExecutionStatus({
  status,
}: ExecutionStatusProps): ReactElement {
  const { executionStatus } = status ?? {};
  const statusName = FlowUtils.getExecutionStatusName(executionStatus);
  return (
    <div className={classes.root}>
      <ExecutionStatusIcon statusCode={executionStatus} />
      <span className={classes.statusLabel}>{statusName}</span>
    </div>
  );
}

function ExecutionStatusIcon(props: {
  statusCode: ExecutionStatusCode | undefined;
}): JSX.Element {
  switch (props.statusCode) {
    case ExecutionStatusCode.EXECUTION_STATUS_EXECUTED:
      return <ExecutedIcon />;
    case ExecutionStatusCode.EXECUTION_STATUS_EXPIRED:
      return <ExpiredIcon />;
    case ExecutionStatusCode.EXECUTION_STATUS_FINALIZED:
      return <FinalizedIcon />;
    case ExecutionStatusCode.EXECUTION_STATUS_SEALED:
      return <SealedIcon />;
    case ExecutionStatusCode.EXECUTION_STATUS_PENDING:
      return <PendingIcon />;
    case ExecutionStatusCode.EXECUTION_STATUS_UNKNOWN:
      return <UnknownIcon />;
    default:
      return <></>;
  }
}
