import React, { FunctionComponent } from "react";
import Card from "../card/Card";
import classes from "./Table.module.scss";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type TableProps = {
  columns: any[];
  data: any[];
};

const Table: FunctionComponent<TableProps> = ({ columns, data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {table.getHeaderGroups().map((headerGroup) => (
        <Card className={classes.tableRow} key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <div key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          ))}
        </Card>
      ))}
      {table.getRowModel().rows.map((row, index) => (
        <Card
          className={classes.tableRow}
          key={row.id}
          showIntroAnimation={data[index].isNew || data[index].isUpdated}
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
};

export default Table;
