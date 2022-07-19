import React, { FunctionComponent } from "react";
import classes from "./TransactionStatusCode.module.scss";
import { ReactComponent as UnknownIcon } from "../../../shared/assets/icons/status-unknown.svg";
import { ReactComponent as TransactionPendingIcon } from "../../../shared/assets/icons/status-pending.svg";
import { ReactComponent as TransactionFinalizedIcon } from "../../../shared/assets/icons/status-finalized.svg";
import { ReactComponent as TransactionExecutedIcon } from "../../../shared/assets/icons/status-executed.svg";
import { ReactComponent as TransactionSealedIcon } from "../../../shared/assets/icons/status-sealed.svg";
import { ReactComponent as TransactionExpiredIcon } from "../../../shared/assets/icons/status-expired.svg";

interface OwnProps {
  statusCode: number;
}

type Props = OwnProps;

const TransactionStatusCode: FunctionComponent<Props> = ({ statusCode }) => {
  const render = (statusCode: number) => {
    switch (statusCode) {
      case 0: // Unknown
        return (
          <span className={`${classes.status} ${classes.unknown}`}>
            <UnknownIcon />
            <span>UNKNOWN</span>
          </span>
        );
      case 1: // Transaction Pending - Awaiting Finalization
        return (
          <span className={`${classes.status} ${classes.pending}`}>
            <TransactionPendingIcon />
            <span>PENDING - Awaiting Finalization</span>
          </span>
        );
      case 2: // Transaction Finalized - Awaiting Execution
        return (
          <span className={`${classes.status} ${classes.finalized}`}>
            <TransactionFinalizedIcon />
            <span>FINALIZED - Awaiting Execution</span>
          </span>
        );
      case 3: // Transaction Executed - Awaiting Sealing
        return (
          <span className={`${classes.status} ${classes.executed}`}>
            <TransactionExecutedIcon />
            <span>EXECUTED - Awaiting Sealing</span>
          </span>
        );
      case 4: // Transaction Sealed
        return (
          <span className={`${classes.status} ${classes.sealed}`}>
            <TransactionSealedIcon />
            <span>SEALED - Transaction Complete</span>
          </span>
        );
      case 5: // Transaction Expired
        return (
          <span className={`${classes.status} ${classes.expired}`}>
            <TransactionExpiredIcon />
            <span>EXPIRED</span>
          </span>
        );
    }
  };
  return <>{render(statusCode)}</>;
};

export default TransactionStatusCode;
