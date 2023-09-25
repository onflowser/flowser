import { BaseTabItem } from "../../../components/tabs/BaseTabs/BaseTabs";
import { TransactionError } from "../../../components/status/ErrorMessage";
import { TransactionSource } from "../TransactionSource/TransactionSource";
import { EventsTable } from "../../events/EventsTable/EventsTable";
import { SignaturesTable } from "../SignaturesTable/SignaturesTable";
import React, { ReactElement } from "react";
import {
  StyledTabs,
  StyledTabsProps,
} from "../../../components/tabs/StyledTabs/StyledTabs";
import { Transaction } from "@flowser/shared";
import { useGetPollingEventsByTransaction } from "../../../hooks/use-api";
import { TransactionOverview } from "../TransactionOverview/TransactionOverview";

type TransactionDetailsTabsProps = Omit<StyledTabsProps, "tabs"> & {
  transaction: Transaction;
  includeOverviewTab: boolean;
  includeScriptTab: boolean;
};

export function TransactionDetailsTabs(
  props: TransactionDetailsTabsProps
): ReactElement {
  const { transaction, includeOverviewTab, includeScriptTab, ...tabProps } =
    props;

  const { data: events } = useGetPollingEventsByTransaction(transaction.id);

  const tabs: BaseTabItem[] = [];

  if (transaction.status?.errorMessage) {
    tabs.push({
      id: "error",
      label: "Error",
      content: (
        <TransactionError
          errorMessage={transaction.status.errorMessage}
          cadenceSource={transaction.script}
        />
      ),
    });
  }

  if (includeOverviewTab) {
    tabs.push({
      id: "overview",
      label: "Overview",
      content: <TransactionOverview transaction={transaction} />,
    });
  }

  if (includeScriptTab) {
    tabs.push({
      id: "script",
      label: "Script",
      content: <TransactionSource transaction={transaction} />,
    });
  }

  tabs.push(
    ...[
      {
        id: "events",
        label: "Events",
        content: <EventsTable events={events} />,
      },
      {
        id: "envelope-signatures",
        label: "Envelope Signatures",
        content: (
          <SignaturesTable signatures={transaction.envelopeSignatures} />
        ),
      },
      {
        id: "payload-signatures",
        label: "Payload Signatures",
        content: <SignaturesTable signatures={transaction.payloadSignatures} />,
      },
    ]
  );

  return <StyledTabs tabs={tabs} {...tabProps} />;
}
