import React, { ReactElement } from "react";
import classes from "./EventsTable.module.scss";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import { createColumnHelper } from "@tanstack/table-core";
import { Event } from "@flowser/shared";
import Table from "../../../components/table/Table";
import ReactTimeago from "react-timeago";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { Ellipsis } from "../../../components/ellipsis/Ellipsis";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { JsonView } from "../../../components/json-view/JsonView";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

const columns = [
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
  columnHelper.accessor("type", {
    header: () => <Label variant="medium">TYPE</Label>,
    meta: {
      className: classes.eventTypeColumn,
    },
    cell: (info) => (
      <Value style={{ width: "100%" }}>
        <Ellipsis elementName="pre">{info.getValue()}</Ellipsis>
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
  columnHelper.accessor("data", {
    meta: {
      className: classes.dataColumn,
    },
    header: () => <Label variant="medium">DATA</Label>,
    cell: (info) => (
      <Value>
        <JsonView
          name="data"
          collapseAtDepth={1}
          data={info.getValue() as Record<string, unknown>}
        />
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
