import React, { ReactElement } from "react";
import classes from "./InteractionOutcome.module.scss";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { TransactionOverview } from "../../../transactions/details/components/overview/TransactionOverview";
import { TransactionErrorMessage } from "../../../../components/status/ErrorMessage";

export function InteractionOutcome(): ReactElement {
  const { outcome } = useInteractionOutcomeManager();
  return (
    <div className={classes.root}>
      {outcome.transaction.success && (
        <TransactionOverview transaction={outcome.transaction.success} />
      )}
      {outcome.transaction.error && (
        <TransactionErrorMessage errorMessage={outcome.transaction.error} />
      )}
    </div>
  );
}
