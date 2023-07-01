import React, { ReactElement } from "react";
import classes from "./InteractionOutcome.module.scss";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { TransactionOverview } from "../../../transactions/details/components/overview/TransactionOverview";

export function InteractionOutcome(): ReactElement {
  const { outcome } = useInteractionOutcomeManager();
  return (
    <div className={classes.root}>
      {outcome.transaction && (
        <TransactionOverview transaction={outcome.transaction} />
      )}
    </div>
  );
}
