import React, { ReactElement } from "react";
import classes from "./InteractionOutcome.module.scss";
import {
  FlowScriptOutcome,
  FlowTransactionOutcome,
  useInteractionOutcomeManager,
} from "../../contexts/outcome.context";
import { TransactionOverview } from "../../../transactions/details/components/overview/TransactionOverview";
import { TransactionErrorMessage } from "../../../../components/status/ErrorMessage";
import { JsonView } from "../../../../components/json-view/JsonView";

export function InteractionOutcome(): ReactElement {
  const { outcome } = useInteractionOutcomeManager();
  return (
    <div className={classes.root}>
      <TransactionOutcome outcome={outcome.transaction} />
      <ScriptOutcome outcome={outcome.script} />
    </div>
  );
}

function TransactionOutcome(props: { outcome: FlowTransactionOutcome }) {
  const { success, error } = props.outcome;

  if (error) {
    return <TransactionErrorMessage errorMessage={error} />;
  }

  if (success) {
    return <TransactionOverview transaction={success} />;
  }

  return null;
}

function ScriptOutcome(props: { outcome: FlowScriptOutcome }) {
  const { success, error } = props.outcome;

  if (error) {
    return <TransactionErrorMessage errorMessage={error} />;
  }

  if (success) {
    return <JsonView data={{ result: success }} />;
  }

  return null;
}
