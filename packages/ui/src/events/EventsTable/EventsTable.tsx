import React, { ReactElement } from "react";
import classes from "./EventsTable.module.scss";
import Label from "../../common/misc/Label/Label";
import Value from "../../common/misc/Value/Value";
import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import { BaseTable } from "../../common/misc/BaseTable/BaseTable";
import { ProjectLink } from "../../common/links/ProjectLink";
import { EventOriginLink } from "../EventOriginLink/EventOriginLink";
import { EventUtils } from "../utils";
import { TimeAgo } from "../../common/time/TimeAgo/TimeAgo";
import { FlowEvent } from "@onflowser/api";
import { TransactionLink } from "../../transactions/TransactionLink/TransactionLink";

const columnHelper = createColumnHelper<FlowEvent>();

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
        <TransactionLink transactionId={info.getValue()} />
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
  events: FlowEvent[];
};

export function EventsTable(props: EventsTableProps): ReactElement {
  return <BaseTable<FlowEvent> data={props.events} columns={columns} />;
}
