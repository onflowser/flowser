import React, { useState, useMemo, ReactElement } from "react";
import classes from "./EventsTable.module.scss";
import tableClasses from "@flowser/ui/table/Table.module.scss";
import Card from "@flowser/ui/cards/base/Card";
import Label from "@flowser/uimisc/Label/Label";
import Value from "@flowser/uimisc/Value/Value";
import { NavLink } from "react-router-dom";
import MiddleEllipsis from "@flowser/ui/ellipsis/MiddleEllipsis";
import CaretIcon from "@flowser/ui/icons/caret/CaretIcon";
import { createColumnHelper } from "@tanstack/table-core";
import { Event } from "@flowser/shared";
import { ComputedEventData, EventUtils } from "../../utils/event-utils";
import CopyButton from "@flowser/ui/buttons/copy-button/CopyButton";
import Table from "@flowser/ui/table/Table";
import { flexRender } from "@tanstack/react-table";
import ReactTimeago from "react-timeago";
import classNames from "classnames";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { Ellipsis } from "@flowser/ui/ellipsis/Ellipsis";

const subTableColumnHelper = createColumnHelper<ComputedEventData>();
const subTableColumns = [
  subTableColumnHelper.accessor("name", {
    header: () => <Label variant="medium">ARGUMENT NAME</Label>,
    cell: (info) => (
      <Value>
        <MiddleEllipsis className={classes.subTableValue}>
          {info.getValue()}
        </MiddleEllipsis>
      </Value>
    ),
  }),
  subTableColumnHelper.accessor("type", {
    header: () => <Label variant="medium">ARGUMENT TYPE</Label>,
    cell: (info) => (
      <Value style={{ width: "100%" }}>
        <MiddleEllipsis className={classes.subTableValue}>
          {info.getValue()}
        </MiddleEllipsis>
      </Value>
    ),
  }),
  subTableColumnHelper.accessor("value", {
    header: () => <Label variant="medium">ARGUMENT VALUE</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis elementName="pre" className={classes.subTableValue}>
          {info.getValue()}
        </Ellipsis>
        <CopyButton value={info.getValue()} />
      </Value>
    ),
  }),
];

type EventsTableProps = {
  events: DecoratedPollingEntity<Event>[];
};

export function EventsTable(props: EventsTableProps): ReactElement {
  const [openedLog, setOpenedLog] = useState("");
  const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("blockId", {
        header: () => <Label variant="medium">BLOCK ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/blocks/details/${info.getValue()}`}>
              <MiddleEllipsis className={classes.hashEvents}>
                {info.getValue()}
              </MiddleEllipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("transactionId", {
        header: () => <Label variant="medium">TX ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/transactions/details/${info.getValue()}`}>
              <MiddleEllipsis className={classes.hashEvents}>
                {info.getValue()}
              </MiddleEllipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("type", {
        header: () => <Label variant="medium">TYPE</Label>,
        meta: {
          className: classes.typeColumn,
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
      columnHelper.display({
        id: "caret",
        meta: {
          className: classes.caretColumn,
        },
        cell: ({ row }) => (
          <CaretIcon
            inverted={true}
            className={classes.icon}
            isOpen={openedLog === row.id}
            onChange={(status) => openLog(status, row.id)}
          />
        ),
      }),
    ],
    [openedLog]
  );

  const openLog = (status: boolean, id: string) => {
    setOpenedLog(!status ? id : "");
  };

  return (
    <Table<DecoratedPollingEntity<Event>>
      data={props.events}
      columns={columns}
      renderCustomHeader={(headerGroup) => (
        <Card
          className={classNames(
            tableClasses.tableRow,
            classes.tableRow,
            tableClasses.headerRow
          )}
          key={headerGroup.id}
        >
          {headerGroup.headers.map((header) => (
            <div
              key={header.id}
              className={header.column.columnDef.meta?.className}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </Card>
      )}
      renderCustomRow={(row) => (
        <React.Fragment key={row.original.id}>
          <Card
            className={classNames(tableClasses.tableRow, classes.tableRow)}
            showIntroAnimation={row.original.isNew}
          >
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className={cell.column.columnDef.meta?.className}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </Card>
          {openedLog === row.id && row.original && (
            <div>
              <Table<ComputedEventData>
                data={EventUtils.computeEventData(row.original.data)}
                columns={subTableColumns}
                bodyRowClass={classes.subTableRow}
                headerRowClass={classes.subTableRow}
              />
            </div>
          )}
        </React.Fragment>
      )}
    />
  );
}
