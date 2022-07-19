import React, { FunctionComponent, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Label from "../../../shared/components/label/Label";
import Value from "../../../shared/components/value/Value";
import DetailsCard from "../../../shared/components/details-card/DetailsCard";
import classes from "./Details.module.scss";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../shared/components/details-tabs/DetailsTabs";
import ContentDetailsScript from "../../../shared/components/content-details-script/ContentDetailsScript";
import Card from "../../../shared/components/card/Card";
import TimeAgo from "../../../shared/components/time-ago/TimeAgo";
import DateWithCalendar from "../../../shared/components/date-with-calendar/DateWithCalendar";
import { Breadcrumb, useNavigation } from "../../../shared/hooks/navigation";
import TransactionStatusCode from "../../../shared/components/transaction-status-code/TransactionStatusCode";
import Ellipsis from "../../../shared/components/ellipsis/Ellipsis";
import EventDetailsTable from "../../../shared/components/event-details-table/EventDetailsTable";
import { useTimeoutPolling } from "../../../shared/hooks/timeout-polling";
import { useDetailsQuery } from "../../../shared/hooks/details-query";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import CaretIcon from "../../../shared/components/caret-icon/CaretIcon";
import { useFormattedDate } from "../../../shared/hooks/formatted-date";

type RouteParams = {
  transactionId: string;
};

const Details: FunctionComponent<any> = () => {
  const { formatDate } = useFormattedDate();
  const [openedLog, setOpenedLog] = useState("");
  const { transactionId } = useParams<RouteParams>();
  const { setBreadcrumbs, showSearchBar } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, isLoading } = useDetailsQuery(
    `/api/transactions/${transactionId}`
  );
  const { data: events } = useTimeoutPolling(
    `/api/transactions/${transactionId}/events/polling`,
    "_id"
  );

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

  if (isLoading || !data) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <DetailsCard
        Header={() => (
          <>
            <div>
              <Label variant="large">TRANSACTION</Label>
              <Value variant="large">{data.id}</Value>
            </div>
            <div>
              <TransactionStatusCode statusCode={data.status.statusCode} />
            </div>
          </>
        )}
        Footer={() => (
          <>
            <TimeAgo date={new Date(data.createdAt).toISOString()} />
            <DateWithCalendar date={new Date(data.createdAt).toISOString()} />
          </>
        )}
      >
        <div className={classes.firstLine}>
          <Label variant="large">BLOCK ID</Label>
          <Value variant="large">
            <NavLink to={`/blocks/details/${data.referenceBlockId}`}>
              {data.referenceBlockId}
            </NavLink>
          </Value>
        </div>
        <div className={classes.twoColumns}>
          <Label variant="large">PROPOSER</Label>
          <Value variant="large">
            <NavLink to={`/accounts/details/${data.proposalKey.address}`}>
              {data.proposalKey.address}
            </NavLink>
          </Value>
          <Label variant="large" className={classes.inlineLabel}>
            Sequence number:
          </Label>
          <Value variant="large" className={classes.inlineValue}>
            {data.proposalKey.sequenceNumber}
          </Value>
        </div>
        <div>
          <Label variant="large">PAYER</Label>
          <Value variant="large">
            <NavLink to={`/accounts/details/${data.payer}`}>
              {data.payer}
            </NavLink>
          </Value>
        </div>
        <div>
          <Label variant="large" className={classes.authorizersLabel}>
            AUTHORIZERS
          </Label>
          <Value variant="large">
            {data.authorizers.map((address: string) => (
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
          <ContentDetailsScript script={data.script} args={data.args} />
        </DetailsTabItem>
        <DetailsTabItem label="GAS LIMIT" value={9000} />
        <DetailsTabItem
          label="PAYLOAD SIGNATURES"
          value={data.payloadSignatures?.length || 0}
        >
          {data.payloadSignatures &&
            data.payloadSignatures.map((item: any, i: number) => (
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
                    <Ellipsis className={classes.hash}>
                      {item.signature}
                    </Ellipsis>
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
          value={data.envelopeSignatures?.length || 0}
        >
          {data.envelopeSignatures &&
            data.envelopeSignatures.map((item: any, i: number) => (
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
                    <Ellipsis className={classes.hash}>
                      {item.signature}
                    </Ellipsis>
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
        <DetailsTabItem label="EVENTS" value={data.status.eventsCount}>
          {events &&
            events.map((item: any, i) => (
              <React.Fragment key={i}>
                <Card
                  className={`${classes.card} ${
                    item.isNew ? classes.isNew : ""
                  }`}
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
                {openedLog === item.id && (
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
