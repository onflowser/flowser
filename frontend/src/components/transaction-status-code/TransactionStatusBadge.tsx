import React, { FunctionComponent } from "react";
import classes from "./TransactionStatusCode.module.scss";
import UnknownIcon from "../../assets/icons/status-unknown.svg";
import TransactionPendingIcon from "../../assets/icons/status-pending.svg";
import TransactionFinalizedIcon from "../../assets/icons/status-finalized.svg";
import TransactionExecutedIcon from "../../assets/icons/status-executed.svg";
import TransactionSealedIcon from "../../assets/icons/status-sealed.svg";
import TransactionExpiredIcon from "../../assets/icons/status-expired.svg";
import { TransactionStatusCode } from "@flowser/types";

type TransactionStatusCodeProps = {
  statusCode: TransactionStatusCode | undefined;
};

const TransactionStatusBadge: FunctionComponent<TransactionStatusCodeProps> = ({
  statusCode,
}) => {
  // TODO(milestone-3): add tooltip for each status code
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
          <span>PENDING</span>
        </span>
      );
    case TransactionStatusCode.FINALIZED:
      return (
        <span className={`${classes.status} ${classes.finalized}`}>
          <TransactionFinalizedIcon />
          <span>FINALIZED</span>
        </span>
      );
    case TransactionStatusCode.EXECUTED:
      return (
        <span className={`${classes.status} ${classes.executed}`}>
          <TransactionExecutedIcon />
          <span>EXECUTED</span>
        </span>
      );
    case TransactionStatusCode.SEALED:
      return (
        <span className={`${classes.status} ${classes.sealed}`}>
          <TransactionSealedIcon />
          <span>SEALED</span>
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
