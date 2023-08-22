import React, { FunctionComponent, useEffect } from "react";
import { useParams } from "react-router-dom";
import classes from "./Details.module.scss";
import { TransactionSource } from "./source/TransactionSource";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import FullScreenLoading from "@flowser/ui/fullscreen-loading/FullScreenLoading";
import {
  useGetPollingEventsByTransaction,
  useGetTransaction,
} from "../../../hooks/use-api";
import { TransactionError } from "@flowser/ui/status/ErrorMessage";
import { TransactionOverview } from "./TransactionOverview";
import { SizedBox } from "@flowser/uimisc/SizedBox";
import { StyledTabs } from "@flowser/ui/tabs/StyledTabs";
import { TabItem } from "@flowser/ui/tabs/Tabs";
import { EventsTable } from "../../events/EventsTable";
import { SignaturesTable } from "./SignaturesTable";

type RouteParams = {
  transactionId: string;
};

const Details: FunctionComponent = () => {
  const { transactionId } = useParams<RouteParams>();
  const { setBreadcrumbs, showSearchBar } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const { data, isLoading } = useGetTransaction(transactionId);
  const { data: events } = useGetPollingEventsByTransaction(transactionId);
  const { transaction } = data ?? {};

  const breadcrumbs: Breadcrumb[] = [
    { to: "/transactions", label: "Transactions" },
    { label: "Details" },
  ];

  useEffect(() => {
    showNavigationDrawer(true);
    setBreadcrumbs(breadcrumbs);
    showSearchBar(false);
  }, []);

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

export default Details;
