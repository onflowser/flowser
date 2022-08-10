import React, { FunctionComponent } from "react";
import classes from "./TransactionStatusCode.module.scss";
import { ReactComponent as UnknownIcon } from "../../../shared/assets/icons/status-unknown.svg";
import { ReactComponent as TransactionPendingIcon } from "../../../shared/assets/icons/status-pending.svg";
import { ReactComponent as TransactionFinalizedIcon } from "../../../shared/assets/icons/status-finalized.svg";
import { ReactComponent as TransactionExecutedIcon } from "../../../shared/assets/icons/status-executed.svg";
import { ReactComponent as TransactionSealedIcon } from "../../../shared/assets/icons/status-sealed.svg";
import { ReactComponent as TransactionExpiredIcon } from "../../../shared/assets/icons/status-expired.svg";
import { TransactionStatusCode } from "@flowser/types/generated/entities/transactions";

type TransactionStatusCodeProps = {
  statusCode: TransactionStatusCode | undefined;
};

const TransactionStatusBadge: FunctionComponent<TransactionStatusCodeProps> = ({
  statusCode,
}) => {
  switch (statusCode) {
    case TransactionStatusCode.UNKNOWN:
      return (
        <span className={`${classes.status} ${classes.unknown}`}>
          <UnknownIcon />
          <span>UNKNOWN</span>
        </span>
      );
    case TransactionStatusCode.PENDING:
      return (
        <span className={`${classes.status} ${classes.pending}`}>
          <TransactionPendingIcon />
          <span>PENDING - Awaiting Finalization</span>
        </span>
      );
    case TransactionStatusCode.FINALIZED:
      return (
        <span className={`${classes.status} ${classes.finalized}`}>
          <TransactionFinalizedIcon />
          <span>FINALIZED - Awaiting Execution</span>
        </span>
      );
    case TransactionStatusCode.EXECUTED:
      return (
        <span className={`${classes.status} ${classes.executed}`}>
          <TransactionExecutedIcon />
          <span>EXECUTED - Awaiting Sealing</span>
        </span>
      );
    case TransactionStatusCode.SEALED:
      return (
        <span className={`${classes.status} ${classes.sealed}`}>
          <TransactionSealedIcon />
          <span>SEALED - Transaction Complete</span>
        </span>
      );
    case TransactionStatusCode.EXPIRED:
      return (
        <span className={`${classes.status} ${classes.expired}`}>
          <TransactionExpiredIcon />
          <span>EXPIRED</span>
        </span>
      );
    default:
      return <></>;
  }
};

export default TransactionStatusBadge;
