import React, { ReactElement, useEffect, useState } from "react";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { ScriptError } from "../../../common/status/ErrorMessage";
import { JsonView } from "../../../common/code/JsonView/JsonView";
import classes from "./InteractionOutcomeDisplay.module.scss";
import { BaseTabItem } from "../../../common/tabs/BaseTabs/BaseTabs";
import { Callout } from "../../../common/misc/Callout/Callout";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { ExternalLink } from "../../../common/links/ExternalLink/ExternalLink";
import { LineSeparator } from "../../../common/misc/LineSeparator/LineSeparator";
import { SpinnerWithLabel } from "../../../common/loaders/Spinner/SpinnerWithLabel";
import { StyledTabs } from "../../../common/tabs/StyledTabs/StyledTabs";
import { TransactionDetailsTabs } from "../../../transactions/TransactionDetailsTabs/TransactionDetailsTabs";
import { ScriptOutcome, TransactionOutcome } from "../../core/core-types";
import { InteractionKind } from "@onflowser/api";
import { useGetTransaction } from "../../../api";
import { ErrorMessage } from "../../../common/errors/ErrorMessage";

export function InteractionOutcomeDisplay(): ReactElement {
  const { outcome } = useInteractionOutcomeManager();
  return (
    <div className={classes.root}>
      {outcome?.script && <ScriptOutcomeDisplay outcome={outcome.script} />}
      {outcome?.transaction && (
        <TransactionOutcomeDisplay outcome={outcome.transaction} />
      )}
      {!outcome && <EmptyState />}
    </div>
  );
}

function EmptyState() {
  const { parsedInteraction } = useInteractionDefinitionManager();

  return (
    <div className={classes.emptyState}>
      <span>Not executed</span>
    </div>
  )
}

function TransactionOutcomeDisplay(props: { outcome: TransactionOutcome }) {
  const { outcome } = props;
  const { data, error } = useGetTransaction(outcome.transactionId!);

  if (!data) {
    return <SpinnerWithLabel label="Executing" />;
  }

  if (error) {
    // This happens if rollback is performed to a block before this transaction.
    return <ErrorMessage className={classes.errorWrapper} error={error} />;
  }

  return (
    <TransactionDetailsTabs
      // Re-mount this component when different transaction is used.
      // This is mainly to reset the initial focused tab.
      key={data.id}
      label="Transaction"
      includeOverviewTab={true}
      includeScriptTab={false}
      transaction={data}
    />
  );
}

function ScriptOutcomeDisplay(props: { outcome: ScriptOutcome }) {
  const { result, error } = props.outcome;
  const { definition } = useInteractionDefinitionManager();
  const resultTabId = "result";
  const errorTabId = "error";
  const [currentTabId, setCurrentTabId] = useState(resultTabId);

  useEffect(() => {
    if (error && currentTabId !== errorTabId) {
      setCurrentTabId(errorTabId);
    }
  }, [error, currentTabId]);

  const tabs: BaseTabItem[] = [];

  if (error) {
    tabs.push({
      id: errorTabId,
      label: "Error",
      content: (
        <ScriptError errorMessage={error} cadenceSource={definition.code} />
      ),
    });
  } else {
    tabs.push({
      id: resultTabId,
      label: "Result",
      content: <JsonView name="result" data={{ value: result }} />,
    });
  }

  return (
    <StyledTabs
      label="Script"
      currentTabId={currentTabId}
      onChangeTab={(tab) => setCurrentTabId(tab.id)}
      tabs={tabs}
    />
  );
}
