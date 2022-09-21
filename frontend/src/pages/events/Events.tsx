import React, { FunctionComponent, useEffect, useState, useMemo } from "react";
import classes from "./Events.module.scss";
import tableClasses from "../../components/table/Table.module.scss";
import Card from "../../components/card/Card";
import Label from "../../components/label/Label";
import Value from "../../components/value/Value";
import { NavLink } from "react-router-dom";
import Ellipsis from "../../components/ellipsis/Ellipsis";
import { useFilterData } from "../../hooks/use-filter-data";
import { useSearch } from "../../hooks/use-search";
import CaretIcon from "../../components/caret-icon/CaretIcon";
import splitbee from "@splitbee/web";
import { useGetPollingEvents } from "../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../hooks/use-timeout-polling";
import { Event } from "@flowser/shared";
import { ComputedEventData, EventUtils } from "../../utils/event-utils";
import CopyButton from "../../components/copy-button/CopyButton";
import Table from "../../components/table/Table";
import { flexRender } from "@tanstack/react-table";
import ReactTimeago from "react-timeago";
import classNames from "classnames";

const subTableColumnHelper = createColumnHelper<ComputedEventData>();
const subTableColumns = [
  subTableColumnHelper.accessor("name", {
    header: () => <Label variant="medium">ARGUMENT NAME</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis className={classes.subTableValue}>{info.getValue()}</Ellipsis>
      </Value>
    ),
  }),
  subTableColumnHelper.accessor("type", {
    header: () => <Label variant="medium">ARGUMENT TYPE</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis className={classes.subTableValue}>{info.getValue()}</Ellipsis>
      </Value>
    ),
  }),
  subTableColumnHelper.accessor("value", {
    header: () => <Label variant="medium">ARGUMENT VALUE</Label>,
    cell: (info) => (
      <Value>
        <Ellipsis
          style={{ whiteSpace: "nowrap", marginRight: 5 }}
          className={classes.subTableValue}
        >
          {info.getValue()}
        </Ellipsis>
        <CopyButton value={info.getValue()} />
      </Value>
    ),
  }),
];

const Events: FunctionComponent = () => {
  const [openedLog, setOpenedLog] = useState("");
  const { searchTerm, setPlaceholder } = useSearch();
  const { data, firstFetch } = useGetPollingEvents();
  const { filteredData } = useFilterData(data, searchTerm);
  const columnHelper = createColumnHelper<DecoratedPollingEntity<Event>>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("blockId", {
        header: () => <Label variant="medium">BLOCK ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/blocks/details/${info.getValue()}`}>
              <Ellipsis className={classes.hashEvents}>
                {info.getValue()}
              </Ellipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("transactionId", {
        header: () => <Label variant="medium">TX ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/transactions/details/${info.getValue()}`}>
              <Ellipsis className={classes.hashEvents}>
                {info.getValue()}
              </Ellipsis>
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
          <Value>
            <pre style={{ whiteSpace: "nowrap" }}>{info.getValue()}</pre>
          </Value>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: () => <Label variant="medium">TIME</Label>,
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

  useEffect(() => {
    setPlaceholder("Search events");
  }, []);

  const openLog = (status: boolean, id: string) => {
    setOpenedLog(!status ? id : "");
    splitbee.track("Events: toggle details");
  };

  return (
    <Table<DecoratedPollingEntity<Event>>
      isInitialLoading={firstFetch}
      data={filteredData}
      columns={columns}
      renderCustomHeader={(headerGroup) => (
        <Card
          className={classNames(tableClasses.tableRow, classes.tableRow)}
          key={headerGroup.id}
          variant="header-row"
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
            variant="table-line"
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
};

export default Events;
