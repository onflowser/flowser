import React, { FunctionComponent } from "react";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import classes from "./EventDetails.module.scss";
import {
  DetailsCard,
  DetailsCardColumn,
} from "../../common/cards/DetailsCard/DetailsCard";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { DateDisplay } from "../../common/time/DateDisplay/DateDisplay";
import { JsonView } from "../../common/code/JsonView/JsonView";
import { ProjectLink } from "../../common/links/ProjectLink";
import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import Value from "../../common/misc/Value/Value";
import { EventOriginLink } from "../EventOriginLink/EventOriginLink";
import { EventUtils } from "../utils";
import { BaseCard } from "../../common/cards/BaseCard/BaseCard";
import { useGetEvent } from "../../api";

type EventDetailsProps = {
  eventId: string;
};

export const EventDetails: FunctionComponent<EventDetailsProps> = (props) => {
  const { eventId } = props;
  const { data: event } = useGetEvent(eventId);

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
      <BaseCard className={classes.dataCard}>
        <JsonView
          name="data"
          collapseAtDepth={1}
          data={event.data as Record<string, unknown>}
        />
      </BaseCard>
    </div>
  );
};
