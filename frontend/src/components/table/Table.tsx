import React, { ReactElement } from "react";
import Card from "../card/Card";
import classes from "./Table.module.scss";
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
import { CommonUtils } from "../../utils/common-utils";
import { ErrorMessage } from "../errors/ErrorMessage";
import FullScreenLoading from "../fullscreen-loading/FullScreenLoading";
import { DecoratedPollingEntity } from "../../contexts/timeout-polling.context";
import { Message } from "../errors/Message";

type CustomTableProps<TData> = {
  renderCustomHeader?: (header: HeaderGroup<TableData<TData>>) => ReactElement;
  renderCustomRow?: (row: Row<TableData<TData>>) => ReactElement;
  headerRowClass?: string;
  bodyRowClass?: string | ((row: Row<TableData<TData>>) => string);
  isInitialLoading?: boolean;
  error?: Error | string | null | undefined;
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

function Table<TData>({
  isInitialLoading,
  columns,
  data,
  renderCustomRow,
  renderCustomHeader,
  headerRowClass,
  bodyRowClass,
  className,
  error,
  enableIntroAnimations = true,
}: TableProps<TData>): ReactElement {
  const table = useReactTable<TableData<TData>>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!isInitialLoading && data.length === 0) {
    return (
      <Message
        title="No results"
        description="It looks like there is nothing here."
      />
    );
  }

  if (isInitialLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classNames(classes.root, className)}>
      {table.getHeaderGroups().map((headerGroup) =>
        renderCustomHeader ? (
          renderCustomHeader(headerGroup)
        ) : (
          <Card
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
          </Card>
        )
      )}
      {table.getRowModel().rows.map((row) =>
        renderCustomRow ? (
          renderCustomRow(row)
        ) : (
          <Card
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
          </Card>
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

export default Table;
