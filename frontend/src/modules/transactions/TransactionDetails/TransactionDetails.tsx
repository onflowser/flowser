import React, { FunctionComponent } from "react";
import classes from "./TransactionDetails.module.scss";
import { TransactionSource } from "../TransactionSource/TransactionSource";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import {
  useGetPollingEventsByTransaction,
  useGetTransaction,
} from "../../../hooks/use-api";
import { TransactionError } from "../../../components/status/ErrorMessage";
import { TransactionOverview } from "../TransactionOverview/TransactionOverview";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { StyledTabs } from "../../../components/tabs/StyledTabs";
import { TabItem } from "../../../components/tabs/Tabs";
import { EventsTable } from "../../events/EventsTable/EventsTable";
import { SignaturesTable } from "../SignaturesTable/SignaturesTable";

type TransactionDetailsProps = {
  transactionId: string;
};

export const TransactionDetails: FunctionComponent<TransactionDetailsProps> = (
  props
) => {
  const { transactionId } = props;
  const { data, isLoading } = useGetTransaction(transactionId);
  const { data: events } = useGetPollingEventsByTransaction(transactionId);
  const { transaction } = data ?? {};

  if (isLoading || !transaction) {
    return <FullScreenLoading />;
  }

  const tabs: TabItem[] = [];

  if (transaction.status?.errorMessage) {
    tabs.push({
      id: "error",
      label: "Error",
      content: (
        <TransactionError errorMessage={transaction.status.errorMessage} />
      ),
    });
  }

  tabs.push(
    ...[
      {
        id: "script",
        label: "Script",
        content: (
          <TransactionSource
            code={transaction.script}
            arguments={transaction.arguments}
          />
        ),
      },
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

  return (
    <div className={classes.root}>
      <TransactionOverview transaction={transaction} />
      <SizedBox height={30} />
      <StyledTabs tabs={tabs} />
    </div>
  );
};
