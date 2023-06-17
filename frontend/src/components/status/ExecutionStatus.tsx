import React, { ReactElement } from "react";
import { ExecutionStatusCode, TransactionStatus } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";
import { ReactComponent as ExpiredIcon } from "../../assets/icons/expired-tx-icon.svg";
import { ReactComponent as SealedIcon } from "../../assets/icons/sealed-tx-icon.svg";
import { ReactComponent as UnknownIcon } from "../../assets/icons/unknown-tx-icon.svg";
import { ReactComponent as PendingIcon } from "../../assets/icons/pending-tx-icon.svg";
import { ReactComponent as FinalizedIcon } from "../../assets/icons/finalised-tx-icon.svg";
import { ReactComponent as ExecutedIcon } from "../../assets/icons/executed-tx-icon.svg";

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
