import React, { ReactElement } from "react";
import classes from "./EventsTable.module.scss";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import { Event } from "@flowser/shared";
import Table from "../../../components/table/Table";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { EventOriginLink } from "../EventOriginLink/EventOriginLink";
import { EventUtils } from "../utils";
import { TimeAgo } from "../../../components/time/TimeAgo/TimeAgo";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

const columns = [
  columnHelper.accessor("id", {
    header: () => <Label variant="medium">IDENTIFIER</Label>,
    cell: (info) => (
      <Value>
        <ProjectLink to={`/events/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hashEvents}>
            {info.getValue()}
          </MiddleEllipsis>
        </ProjectLink>
      </Value>
    ),
  }),
  columnHelper.display({
    id: "origin",
    header: () => <Label variant="medium">ORIGIN</Label>,
    cell: (info) => (
      <Value style={{ width: "100%" }}>
        <EventOriginLink event={info.row.original} />
      </Value>
    ),
  }),
  columnHelper.display({
    id: "type",
    header: () => <Label variant="medium">TYPE</Label>,
    cell: (info) => (
      <Value style={{ width: "100%" }}>
        <div>
          {EventUtils.parseFullEventType(info.row.original.type).eventType}
        </div>
      </Value>
    ),
  }),
  columnHelper.accessor("transactionId", {
    header: () => <Label variant="medium">TRANSACTION</Label>,
    cell: (info) => (
      <Value>
        <ProjectLink to={`/transactions/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hashEvents}>
            {info.getValue()}
          </MiddleEllipsis>
        </ProjectLink>
      </Value>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: () => <Label variant="medium">CREATED</Label>,
    cell: (info) => (
      <Value>
        <TimeAgo date={info.getValue()} />
      </Value>
    ),
  }),
];

type EventsTableProps = {
  events: DecoratedPollingEntity<Event>[];
};

export function EventsTable(props: EventsTableProps): ReactElement {
  return (
    <Table<DecoratedPollingEntity<Event>>
      data={props.events}
      columns={columns}
    />
  );
}
