import React, { FunctionComponent } from "react";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetPollingEvents } from "../../../hooks/use-api";
import classes from "./EventDetails.module.scss";
import {
  DetailsCard,
  DetailsCardColumn,
} from "components/details-card/DetailsCard";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { DateDisplay } from "../../../components/time/DateDisplay/DateDisplay";
import { JsonView } from "../../../components/json-view/JsonView";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import Value from "../../../components/value/Value";
import { EventOriginLink } from "../EventOriginLink/EventOriginLink";
import { EventUtils } from "../utils";
import Card from "../../../components/card/Card";

type EventDetailsProps = {
  eventId: string;
};

export const EventDetails: FunctionComponent<EventDetailsProps> = (props) => {
  const { eventId } = props;
  const { data } = useGetPollingEvents();
  const event = data.find((event) => event.id === eventId);

  if (!event) {
    return <FullScreenLoading />;
  }

  const rows: DetailsCardColumn = [
    {
      label: "Identifier",
      value: (
        <Value>
          <MiddleEllipsis className={classes.hashEvents}>
            {event.id}
          </MiddleEllipsis>
        </Value>
      ),
    },
    {
      label: "Origin",
      value: <EventOriginLink event={event} />,
    },
    {
      label: "Type",
      value: (
        <Value style={{ width: "100%" }}>
          <div>{EventUtils.parseFullEventType(event.type).eventType}</div>
        </Value>
      ),
    },
    {
      label: "Block",
      value: (
        <Value>
          <ProjectLink to={`/blocks/${event.blockId}`}>
            <MiddleEllipsis>{event.blockId}</MiddleEllipsis>
          </ProjectLink>
        </Value>
      ),
    },
    {
      label: "Transaction",
      value: (
        <Value>
          <ProjectLink to={`/transactions/${event.transactionId}`}>
            <MiddleEllipsis>{event.transactionId}</MiddleEllipsis>
          </ProjectLink>
        </Value>
      ),
    },
    {
      label: "Created date",
      value: <DateDisplay date={event.createdAt} />,
    },
  ];

  return (
    <div className={classes.root}>
      <DetailsCard columns={[rows]} />
      <SizedBox height={30} />
      <Card className={classes.dataCard}>
        <JsonView
          name="data"
          collapseAtDepth={1}
          data={event.data as Record<string, unknown>}
        />
      </Card>
    </div>
  );
};
