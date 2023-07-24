import React, { ReactElement } from "react";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { TransactionOverview } from "../../../transactions/details/components/overview/TransactionOverview";
import { TransactionErrorMessage } from "../../../../components/status/ErrorMessage";
import { JsonView } from "../../../../components/json-view/JsonView";
import { useGetTransaction } from "../../../../hooks/use-api";
import { Spinner } from "../../../../components/spinner/Spinner";
import classes from "./InteractionOutcome.module.scss";
import {
  FlowScriptOutcome,
  FlowTransactionOutcome,
} from "pages/interactions/contexts/interaction-registry.context";

export function InteractionOutcome(): ReactElement {
  const { outcome } = useInteractionOutcomeManager();
  return (
    <div className={classes.root}>
      {outcome?.script && <ScriptOutcome outcome={outcome.script} />}
      {outcome?.transaction && (
        <TransactionOutcome outcome={outcome.transaction} />
      )}
    </div>
  );
}

function TransactionOutcome(props: { outcome: FlowTransactionOutcome }) {
  const { transactionId, error } = props.outcome;
  const { data } = useGetTransaction(transactionId);

  if (error) {
    return <TransactionErrorMessage errorMessage={error} />;
  }

  if (data?.transaction) {
    return <TransactionOverview transaction={data.transaction} />;
  } else {
    return <Spinner size={50} />;
  }
}

function ScriptOutcome(props: { outcome: FlowScriptOutcome }) {
  const { result, error } = props.outcome;

  if (error) {
    return <TransactionErrorMessage errorMessage={error} />;
  }

  return <JsonView data={{ result: result }} />;
}
