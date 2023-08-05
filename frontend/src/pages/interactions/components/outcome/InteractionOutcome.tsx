import React, { ReactElement, useEffect, useState } from "react";
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
import { TabItem, TabList } from "../../../../components/tab-list/TabList";

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
  const { outcome } = props;
  const { data } = useGetTransaction(outcome.transactionId);
  const error = outcome.error ?? data?.transaction?.status?.errorMessage;
  const overviewTabId = "overview";
  const errorTabId = "error";
  const [currentTabId, setCurrentTabId] = useState(
    error ? errorTabId : overviewTabId
  );

  useEffect(() => {
    if (error && currentTabId !== errorTabId) {
      setCurrentTabId(errorTabId);
    }
  }, [error, currentTabId]);

  if (!data?.transaction) {
    return <CenteredSpinner />;
  }

  const tabs: TabItem[] = [];

  if (error) {
    tabs.push({
      id: errorTabId,
      label: "Error",
      content: <TransactionErrorMessage errorMessage={error} />,
    });
  } else {
    tabs.push({
      id: overviewTabId,
      label: "Overview",
      content: <TransactionOverview transaction={data.transaction} />,
    });
  }

  return (
    <TabList
      label="Transaction"
      currentTabId={currentTabId}
      tabWrapperClassName={classes.tabWrapper}
      inactiveTabClassName={classes.inactiveTab}
      tabLabelClassName={classes.tabLabel}
      tabClassName={classes.tab}
      onChangeTab={(tab) => setCurrentTabId(tab.id)}
      tabs={tabs}
    />
  );
}

function ScriptOutcome(props: { outcome: FlowScriptOutcome }) {
  const { result, error } = props.outcome;

  if (error) {
    return <TransactionErrorMessage errorMessage={error} />;
  }

  return <JsonView name="result" data={{ value: result }} />;
}

function CenteredSpinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Spinner size={50} />
    </div>
  );
}
