import React, { FunctionComponent } from "react";
import classes from "./TransactionStatusBadge.module.scss";
import { FlowUtils } from "../../utils/flow-utils";
import classNames from "classnames";
import { ExecutionStatusCode, TransactionStatus } from "@onflowser/api";

type ExecutionStatusCodeProps = {
  status: TransactionStatus | undefined;
  className?: string;
};

export const ExecutionStatusBadge: FunctionComponent<
  ExecutionStatusCodeProps
> = ({ status, className }) => {
  const statusName = FlowUtils.getExecutionStatusName(status?.executionStatus);
  const backgroundColor = getBackgroundColor(status?.executionStatus);
  const color = getTextColor(status?.executionStatus);

  return (
    <div
      className={classNames(classes.root, className)}
      style={{ backgroundColor, color }}
    >
      {statusName}
    </div>
  );
};

function getBackgroundColor(statusCode: ExecutionStatusCode | undefined) {
  switch (statusCode) {
    case ExecutionStatusCode.EXECUTION_STATUS_EXECUTED:
      return "#9D3CC7";
    case ExecutionStatusCode.EXECUTION_STATUS_EXPIRED:
      return "#dd868b";
    case ExecutionStatusCode.EXECUTION_STATUS_FINALIZED:
      return "#F89473";
    case ExecutionStatusCode.EXECUTION_STATUS_PENDING:
      return "#EAEA84";
    case ExecutionStatusCode.EXECUTION_STATUS_SEALED:
      return "#A2CE8D";
    case ExecutionStatusCode.EXECUTION_STATUS_UNKNOWN:
    default:
      return "#D0D2D6";
  }
}

function getTextColor(statusCode: ExecutionStatusCode | undefined) {
  switch (statusCode) {
    case ExecutionStatusCode.EXECUTION_STATUS_EXECUTED:
      return "#218300";
    case ExecutionStatusCode.EXECUTION_STATUS_EXPIRED:
      return "#FFFFFF";
    case ExecutionStatusCode.EXECUTION_STATUS_FINALIZED:
      return "#FFFFFF";
    case ExecutionStatusCode.EXECUTION_STATUS_PENDING:
      return "#A88903";
    case ExecutionStatusCode.EXECUTION_STATUS_SEALED:
      return "#218300";
    case ExecutionStatusCode.EXECUTION_STATUS_UNKNOWN:
    default:
      return "#837E7E";
  }
}
