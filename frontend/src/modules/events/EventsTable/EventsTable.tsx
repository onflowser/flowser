import React, { ReactElement } from "react";
import classes from "./EventsTable.module.scss";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { MiddleEllipsis } from "../../../components/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import { Event } from "@flowser/shared";
import Table from "../../../components/table/Table";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { JsonView } from "../../../components/json-view/JsonView";
import { ExternalLink } from "../../../components/links/ExternalLink";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

const columns = [
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
        <EventType event={info.row.original} />
      </Value>
    ),
  }),
  columnHelper.accessor("blockId", {
    header: () => <Label variant="medium">BLOCK</Label>,
    cell: (info) => (
      <Value>
        <ProjectLink to={`/blocks/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hashEvents}>
            {info.getValue()}
          </MiddleEllipsis>
        </ProjectLink>
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
  columnHelper.accessor("data", {
    meta: {
      className: classes.dataColumn,
    },
    header: () => <Label variant="medium">DATA</Label>,
    cell: (info) => (
      <Value>
        <JsonView
          name="data"
          collapseAtDepth={0}
          data={info.getValue() as Record<string, unknown>}
        />
      </Value>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: () => <Label variant="medium">CREATED</Label>,
    cell: (info) => (
      <Value>
        <ReactTimeago date={info.getValue()} />
      </Value>
    ),
  }),
];

function EventOriginLink(props: { event: Event }) {
  const { type } = props.event;

  const { contractName, contractAddress } = parseEventId(type);

  // Core flow events are emitted from the Flow Virtual Machine.
  if (contractName && contractAddress) {
    return (
      <ProjectLink to={`/contracts/0x${contractAddress}.${contractName}`}>
        A.{contractAddress}.{contractName}
      </ProjectLink>
    );
  } else {
    return (
      <ExternalLink
        inline
        href="https://developers.flow.com/cadence/language/core-events"
      >
        FVM
      </ExternalLink>
    );
  }
}

function EventType(props: { event: Event }) {
  const { type } = props.event;

  const { eventType } = parseEventId(type);

  return <div>{eventType}</div>;
}

type ParsedEventId = {
  // Value is `undefined` if event is a core flow event.
  // https://developers.flow.com/cadence/language/core-events
  contractAddress: undefined | string;
  contractName: undefined | string;
  eventType: string;
};

function parseEventId(eventId: string): ParsedEventId {
  const parts = eventId.split(".");

  if (eventId.startsWith("flow.")) {
    return {
      contractAddress: undefined,
      contractName: undefined,
      eventType: parts[1],
    };
  } else {
    return {
      contractAddress: parts[1],
      contractName: parts[2],
      eventType: parts[3],
    };
  }
}

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
