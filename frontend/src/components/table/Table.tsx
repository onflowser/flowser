import React, { ReactElement } from "react";
import Card from "../card/Card";
import classes from "./Table.module.scss";
import {
  flexRender,
  getCoreRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { DecoratedPollingEntity } from "../../hooks/use-timeout-polling";
import { CommonUtils } from "../../utils/common-utils";

export type TableProps<TData> = Pick<
  TableOptions<TableData<TData>>,
  "data" | "columns"
>;

export type TableData<TData> = DecoratedPollingEntity<TData> | TData;

function Table<TData>({ columns, data }: TableProps<TData>): ReactElement {
  const table = useReactTable<TableData<TData>>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {table.getHeaderGroups().map((headerGroup) => (
        <Card
          className={`${classes.tableRow} ${classes.headerRow}`}
          key={headerGroup.id}
          variant="header-row"
        >
          {headerGroup.headers.map((header) => (
            <div key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </Card>
      ))}
      {table.getRowModel().rows.map((row) => (
        <Card
          className={classes.tableRow}
          key={row.id}
          showIntroAnimation={showIntroAnimation(row)}
          variant="table-line"
        >
          {row.getVisibleCells().map((cell) => (
            <div key={cell.id} className={classes.element}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
        </Card>
      ))}
      {table.getFooterGroups().map((footerGroup) => (
        <div className={classes.tableRow} key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <div key={header.id}>
              {flexRender(header.column.columnDef.footer, header.getContext())}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function showIntroAnimation<TData>(dataItem: TableData<TData>) {
  if (CommonUtils.isDecoratedPollingEntity(dataItem)) {
    return dataItem.isNew || dataItem.isUpdated;
  } else {
    return false;
  }
}

export default Table;
