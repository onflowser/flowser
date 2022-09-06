import React, { FunctionComponent } from "react";
import classes from "./TransactionStatusCode.module.scss";
import { ReactComponent as ExecutedIcon } from "../../assets/icons/executed-tx-icon.svg";
import { ReactComponent as ExpiredIcon } from "../../assets/icons/expired-tx-icon.svg";
import { ReactComponent as FinalisedIcon } from "../../assets/icons/finalised-tx-icon.svg";
import { ReactComponent as PendingIcon } from "../../assets/icons/pending-tx-icon.svg";
import { ReactComponent as SealedIcon } from "../../assets/icons/sealed-tx-icon.svg";
import { ReactComponent as UnknownIcon } from "../../assets/icons/unknown-tx-icon.svg";
import { ExecutionStatusCode } from "@flowser/shared";

type ExecutionStatusCodeProps = {
  statusCode: ExecutionStatusCode | undefined;
};

const TransactionStatusBadge: FunctionComponent<ExecutionStatusCodeProps> = ({
  statusCode,
}) => {
  // TODO(milestone-3): add tooltip for each status code
  switch (statusCode) {
    case ExecutionStatusCode.EXECUTION_STATUS_UNKNOWN:
      return (
        <span className={`${classes.status} ${classes.unknown}`}>
          <UnknownIcon />
          <span>UNKNOWN</span>
        </span>
      );
    case ExecutionStatusCode.EXECUTION_STATUS_PENDING:
      return (
        <span className={`${classes.status} ${classes.pending}`}>
          <PendingIcon />
          <span>PENDING</span>
        </span>
      );
    case ExecutionStatusCode.EXECUTION_STATUS_FINALIZED:
      return (
        <span className={`${classes.status} ${classes.finalized}`}>
          <FinalisedIcon />
          <span>FINALIZED</span>
        </span>
      );
    case ExecutionStatusCode.EXECUTION_STATUS_EXECUTED:
      return (
        <span className={`${classes.status} ${classes.executed}`}>
          <ExecutedIcon />
          <span>EXECUTED</span>
        </span>
      );
    case ExecutionStatusCode.EXECUTION_STATUS_SEALED:
      return (
        <span className={`${classes.status} ${classes.sealed}`}>
          <SealedIcon />
          <span>SEALED</span>
        </span>
      );
    case ExecutionStatusCode.EXECUTION_STATUS_EXPIRED:
      return (
        <span className={`${classes.status} ${classes.expired}`}>
          <ExpiredIcon />
          <span>EXPIRED</span>
        </span>
      );
    default:
      return (
        <>
          <UnknownIcon />
        </>
      );
  }
};

export default TransactionStatusBadge;
