import React, { ReactElement, useEffect, useState } from "react";
import { useInteractionOutcomeManager } from "../../contexts/outcome.context";
import { TransactionOverview } from "../../../transactions/details/components/overview/TransactionOverview";
import {
  ScriptError,
  TransactionError,
} from "../../../../components/status/ErrorMessage";
import { JsonView } from "../../../../components/json-view/JsonView";
import { useGetTransaction } from "../../../../hooks/use-api";
import classes from "./InteractionOutcome.module.scss";
import {
  FlowScriptOutcome,
  FlowTransactionOutcome,
} from "pages/interactions/contexts/interaction-registry.context";
import { TabItem, TabList } from "../../../../components/tab-list/TabList";
import { Callout } from "../../../../components/callout/Callout";
import { useInteractionDefinitionManager } from "../../contexts/definition.context";
import { InteractionKind } from "@flowser/shared";
import { ExternalLink } from "../../../../components/link/ExternalLink";
import { LineSeparator } from "../../../../components/line-separator/LineSeparator";
import { SpinnerWithLabel } from "../../../../components/spinner/SpinnerWithLabel";

export function InteractionOutcome(): ReactElement {
  const { outcome } = useInteractionOutcomeManager();
  return (
    <div className={classes.root}>
      {outcome?.script && <ScriptOutcome outcome={outcome.script} />}
      {outcome?.transaction && (
        <TransactionOutcome outcome={outcome.transaction} />
      )}
      {!outcome && (
        <div className={classes.emptyStateWrapper}>
          <EmptyState />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const { parsedInteraction } = useInteractionDefinitionManager();

  switch (parsedInteraction?.kind) {
    case InteractionKind.INTERACTION_SCRIPT:
      return (
        <Callout
          icon="💡"
          title="Cadence scripts"
          description={
            <div>
              <p>
                Here are a few resources you can look into, to learn more about
                Cadence scripts on Flow.
              </p>
              <LineSeparator horizontal />
              <ExternalLink href="https://academy.ecdao.org/en/cadence-by-example/6-scripts" />
              <ExternalLink href="https://academy.ecdao.org/en/catalog/courses/beginner-cadence/chapter2/lesson2#scripts" />
            </div>
          }
        />
      );
    case InteractionKind.INTERACTION_TRANSACTION:
      return (
        <Callout
          icon="💡"
          title="Cadence transactions"
          description={
            <div>
              <p>
                Here are a few resources you can look into, to learn more about
                Cadence transactions on Flow.
              </p>
              <LineSeparator horizontal />
              <ExternalLink href="https://developers.flow.com/cadence/language/transactions" />
              <ExternalLink href="https://academy.ecdao.org/en/cadence-by-example/5-transaction" />
              <ExternalLink href="https://academy.ecdao.org/en/catalog/courses/beginner-cadence/chapter2/lesson2#transactions" />
            </div>
          }
        />
      );
    default:
      return (
        <Callout
          icon="🚀"
          title="Getting started #onFlow"
          description={
            <div>
              <p>
                Here are some resources that should help you get started on
                Flow.
              </p>
              <LineSeparator horizontal />
              <ExternalLink href="https://developers.flow.com" />
              <ExternalLink href="https://academy.ecdao.org" />
            </div>
          }
        />
      );
  }
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
  }, [error]);

  if (!data?.transaction) {
    return <SpinnerWithLabel label="Executing" />;
  }

  const tabs: TabItem[] = [];

  tabs.push({
    id: overviewTabId,
    label: "Overview",
    content: <TransactionOverview transaction={data.transaction} />,
  });

  if (error) {
    tabs.push({
      id: errorTabId,
      label: "Error",
      content: (
        // TODO(design-revamp): Consolidate body layout styles
        <div style={{ padding: 10 }}>
          {data.transaction.status?.errorMessage ? (
            <TransactionError
              errorMessage={data.transaction.status.errorMessage}
            />
          ) : (
            <pre>{outcome.error}</pre>
          )}
        </div>
      ),
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
  const resultTabId = "result";
  const errorTabId = "result";
  const [currentTabId, setCurrentTabId] = useState(resultTabId);

  useEffect(() => {
    if (error && currentTabId !== errorTabId) {
      setCurrentTabId(errorTabId);
    }
  }, [error, currentTabId]);

  const tabs: TabItem[] = [];

  if (error) {
    tabs.push({
      id: errorTabId,
      label: "Error",
      content: (
        // TODO(design-revamp): Consolidate body layout styles
        <div style={{ padding: 10 }}>
          <ScriptError errorMessage={error} />
        </div>
      ),
    });
  } else {
    tabs.push({
      id: resultTabId,
      label: "Result",
      content: (
        // TODO(design-revamp): Consolidate body layout styles
        <div style={{ padding: 10 }}>
          <JsonView name="result" data={{ value: result }} />
        </div>
      ),
    });
  }

  return (
    <TabList
      label="Script"
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
