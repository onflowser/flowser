import React, { ReactElement } from "react";
import { BaseCard } from "../../cards/BaseCard/BaseCard";
import classes from "./BaseTable.module.scss";
import classNames from "classnames";
import {
  flexRender,
  getCoreRowModel,
  HeaderGroup,
  Row,
  TableOptions,
  useReactTable,
  RowData,
} from "@tanstack/react-table";
import { CommonUtils } from "../../../utils/common-utils";
import { DecoratedPollingEntity } from "../../../contexts/timeout-polling.context";
import { Message } from "../../errors/Message";

type CustomTableProps<TData> = {
  renderCustomHeader?: (header: HeaderGroup<TableData<TData>>) => ReactElement;
  renderCustomRow?: (row: Row<TableData<TData>>) => ReactElement;
  headerRowClass?: string;
  bodyRowClass?: string | ((row: Row<TableData<TData>>) => string);
};

export type TableProps<TData> = Pick<
  TableOptions<TableData<TData>>,
  "data" | "columns"
> &
  CustomTableProps<TData> & {
    className?: string;
    enableIntroAnimations?: boolean;
  };

export type TableData<TData> = DecoratedPollingEntity<TData> | TData;

declare module "@tanstack/table-core" {
  // https://tanstack.com/table/v8/docs/api/core/column-def#meta
  interface ColumnMeta<TData extends RowData, TValue> {
    // Can be used to assign a custom class name to a column.
    className?: string;
  }
}

export function BaseTable<TData>({
  columns,
  data,
  renderCustomRow,
  renderCustomHeader,
  headerRowClass,
  bodyRowClass,
  className,
  enableIntroAnimations = false,
}: TableProps<TData>): ReactElement {
  const table = useReactTable<TableData<TData>>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={classNames(classes.root, className)}>
      {table.getHeaderGroups().map((headerGroup) =>
        renderCustomHeader ? (
          renderCustomHeader(headerGroup)
        ) : (
          <BaseCard
            className={classNames(
              classes.tableRow,
              classes.headerRow,
              headerRowClass
            )}
            key={headerGroup.id}
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className={header.column.columnDef.meta?.className}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </div>
            ))}
          </BaseCard>
        )
      )}
      {table.getRowModel().rows.length === 0 && (
        <Message
          className={classes.message}
          title="No results"
          description="It looks like there is nothing here."
        />
      )}
      {table.getRowModel().rows.map((row) =>
        renderCustomRow ? (
          renderCustomRow(row)
        ) : (
          <BaseCard
            className={classNames(
              classes.tableRow,
              typeof bodyRowClass === "function"
                ? bodyRowClass(row)
                : bodyRowClass
            )}
            key={row.id}
            showIntroAnimation={
              showIntroAnimation(row.original) && enableIntroAnimations
            }
          >
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className={cell.column.columnDef.meta?.className}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </BaseCard>
        )
      )}
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
