import React, { FunctionComponent, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import DetailsCard from "../../../components/details-card/DetailsCard";
import classes from "./Details.module.scss";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import Card from "../../../components/card/Card";
import TimeAgo from "../../../components/time-ago/TimeAgo";
import DateWithCalendar from "../../../components/date-with-calendar/DateWithCalendar";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import TransactionStatusBadge from "../../../components/transaction-status-code/TransactionStatusBadge";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import EventDetailsTable from "../../../components/event-details-table/EventDetailsTable";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import CaretIcon from "../../../components/caret-icon/CaretIcon";
import { useFormattedDate } from "../../../hooks/use-formatted-date";
import {
  useGetPollingEventsByTransaction,
  useGetTransaction,
} from "../../../hooks/use-api";

type RouteParams = {
  transactionId: string;
};

const Details: FunctionComponent = () => {
  const { formatDate } = useFormattedDate();
  const [openedLog, setOpenedLog] = useState("");
  const { transactionId } = useParams<RouteParams>();
  const { setBreadcrumbs, showSearchBar } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, isLoading } = useGetTransaction(transactionId);
  const { data: events } = useGetPollingEventsByTransaction(transactionId);
  const { transaction } = data ?? {};

  const breadcrumbs: Breadcrumb[] = [
    { to: "/transactions", label: "Transactions" },
    { label: "Details" },
  ];

  useEffect(() => {
    showNavigationDrawer(true);
    showSubNavigation(false);
    setBreadcrumbs(breadcrumbs);
    showSearchBar(false);
  }, []);

  const openLog = (status: boolean, id: string) => {
    setOpenedLog(!status ? id : "");
  };

  if (isLoading || !transaction) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <DetailsCard
        Header={() => (
          <>
            <div>
              <Label variant="large">TRANSACTION</Label>
              <Value variant="large">{transaction.id}</Value>
            </div>
            <div>
              <TransactionStatusBadge
                statusCode={transaction.status?.statusCode}
              />
            </div>
          </>
        )}
        Footer={() => (
          <>
            <TimeAgo date={new Date(transaction.createdAt).toISOString()} />
            <DateWithCalendar
              date={new Date(transaction.createdAt).toISOString()}
            />
          </>
        )}
      >
        <div className={classes.firstLine}>
          <Label variant="large">BLOCK ID</Label>
          <Value variant="large">
            <NavLink to={`/blocks/details/${transaction.blockId}`}>
              {transaction.blockId}
            </NavLink>
          </Value>
        </div>
        <div className={classes.twoColumns}>
          <Label variant="large">PROPOSER</Label>
          <Value variant="large">
            <NavLink
              to={
                transaction.proposalKey
                  ? `/accounts/details/${transaction.proposalKey.address}`
                  : "#"
              }
            >
              {transaction.proposalKey?.address ?? "-"}
            </NavLink>
          </Value>
          <Label variant="large" className={classes.inlineLabel}>
            Sequence number:
          </Label>
          <Value variant="large" className={classes.inlineValue}>
            {transaction.proposalKey?.sequenceNumber ?? "-"}
          </Value>
        </div>
        <div>
          <Label variant="large">PAYER</Label>
          <Value variant="large">
            <NavLink to={`/accounts/details/${transaction.payer}`}>
              {transaction.payer}
            </NavLink>
          </Value>
        </div>
        <div>
          <Label variant="large" className={classes.authorizersLabel}>
            AUTHORIZERS
          </Label>
          <Value variant="large">
            {transaction.authorizers.map((address: string) => (
              <NavLink
                key={address}
                className={classes.authorizersAddress}
                to={`/accounts/${address}`}
              >
                {address}
              </NavLink>
            ))}
          </Value>
        </div>
      </DetailsCard>
      <DetailsTabs>
        <DetailsTabItem label="SCRIPT" value="<>">
          <ContentDetailsScript
            script={transaction.script}
            args={transaction.args}
          />
        </DetailsTabItem>
        <DetailsTabItem label="GAS LIMIT" value={9000} />
        <DetailsTabItem
          label="PAYLOAD SIGNATURES"
          value={transaction.payloadSignatures?.length || 0}
        >
          {transaction.payloadSignatures.map((item, i: number) => (
            <Card key={i} className={classes.listCard}>
              <div>
                <Label className={classes.label}>ACCOUNT ADDRESS</Label>
                <Value>
                  <NavLink to={`/accounts/details/${item.address}`}>
                    {item.address}
                  </NavLink>
                </Value>
              </div>
              <div>
                <Label className={classes.label}>SIGNATURE</Label>
                <Value>
                  <Ellipsis className={classes.hash}>{item.signature}</Ellipsis>
                </Value>
              </div>
              <div>
                <Label className={classes.label}>KEY ID</Label>
                <Value>{item.keyId}</Value>
              </div>
              <div></div>
            </Card>
          ))}
        </DetailsTabItem>
        <DetailsTabItem
          label="ENVELOPE SIGNATURES"
          value={transaction.envelopeSignatures.length}
        >
          {transaction.envelopeSignatures.map((item, i) => (
            <Card key={i} className={classes.listCard}>
              <div>
                <Label className={classes.label}>ACCOUNT ADDRESS</Label>
                <Value>
                  <NavLink to={`/accounts/details/${item.address}`}>
                    {item.address}
                  </NavLink>
                </Value>
              </div>
              <div>
                <Label className={classes.label}>SIGNATURE</Label>
                <Value>
                  <Ellipsis className={classes.hash}>{item.signature}</Ellipsis>
                </Value>
              </div>
              <div>
                <Label className={classes.label}>KEY ID</Label>
                <Value>{item.keyId}</Value>
              </div>
              <div></div>
            </Card>
          ))}
        </DetailsTabItem>
        <DetailsTabItem label="EVENTS" value={events.length}>
          {events.map((item, i) => (
            <React.Fragment key={i}>
              <Card
                showIntroAnimation={item.isNew || item.isUpdated}
                className={classes.card}
              >
                <div>
                  <Label>TIMESTAMP</Label>
                  <Value>
                    {formatDate(new Date(item.createdAt).toISOString())}
                  </Value>
                </div>
                <div>
                  <Label>TYPE</Label>
                  <Value>{item.type}</Value>
                </div>
                <div>
                  <Label title="TRANSACTION INDEX">TX INDEX</Label>
                  <Value>{item.transactionIndex}</Value>
                </div>
                <div>
                  <Label>EVENT INDEX</Label>
                  <Value>{item.eventIndex}</Value>
                </div>
                <div>
                  <CaretIcon
                    inverted={true}
                    isOpen={openedLog === item.id}
                    className={classes.control}
                    onChange={(status) => openLog(status, item.id)}
                  />
                </div>
              </Card>
              {openedLog === item.id && item.data && (
                <EventDetailsTable
                  className={classes.detailsTable}
                  data={item.data}
                />
              )}
            </React.Fragment>
          ))}
        </DetailsTabItem>
      </DetailsTabs>
    </div>
  );
};

export default Details;
