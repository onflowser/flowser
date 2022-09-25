import React, { FunctionComponent, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useFilterData } from "../../../hooks/use-filter-data";
import { useSearch } from "../../../hooks/use-search";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import classes from "./Main.module.scss";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import { useNavigation } from "../../../hooks/use-navigation";
import { createColumnHelper } from "@tanstack/table-core";
import Table from "../../../components/table/Table";
import { Block } from "@flowser/shared";
import {
  useGetPollingBlocks,
  useGetPollingEmulatorSnapshots,
} from "../../../hooks/use-api";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import { ReactComponent as SnapshotIcon } from "../../../assets/icons/snapshot.svg";
import ReactTimeago from "react-timeago";
import { useProjectActions } from "../../../contexts/project-actions.context";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import Card from "components/card/Card";
import tableClasses from "../../../components/table/Table.module.scss";
import { flexRender } from "@tanstack/react-table";
import classNames from "classnames";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Block>>();

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder } = useSearch();
  const { showNavigationDrawer } = useNavigation();
  const { revertToBlock } = useProjectActions();

  const { data: blocks, firstFetch } = useGetPollingBlocks();
  const { data: emulatorSnapshots } = useGetPollingEmulatorSnapshots();
  const { filteredData } = useFilterData(blocks, searchTerm);
  const snapshotLookupByBlockId = useMemo(
    () =>
      new Map(
        emulatorSnapshots.map((snapshot) => [snapshot.blockId, snapshot])
      ),
    [emulatorSnapshots]
  );

  useEffect(() => {
    setPlaceholder("Search blocks");
    showNavigationDrawer(false);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("height", {
        header: () => <Label variant="medium">HEIGHT</Label>,
        meta: {
          className: classes.blockHeight,
        },
        cell: (info) => <Value>{info.getValue()}</Value>,
      }),
      columnHelper.accessor("id", {
        header: () => <Label variant="medium">ID</Label>,
        meta: {
          className: classes.blockID,
        },
        cell: (info) => (
          <Value>
            <NavLink to={`/blocks/details/${info.getValue()}`}>
              <MiddleEllipsis className={classes.hash}>
                {info.getValue()}
              </MiddleEllipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("blockSeals", {
        header: () => <Label variant="medium">SEALS COUNT</Label>,
        meta: {
          className: classes.blockSeals,
        },
        cell: (info) => <Value>{info.getValue()?.length}</Value>,
      }),
      columnHelper.accessor("signatures", {
        header: () => <Label variant="medium">SIGS COUNT</Label>,
        meta: {
          className: classes.signatures,
        },
        cell: (info) => <Value>{info.getValue()?.length}</Value>,
      }),
      columnHelper.accessor("timestamp", {
        header: () => <Label variant="medium">TIME</Label>,
        meta: {
          className: classes.time,
        },
        cell: (info) => (
          <Value>
            <ReactTimeago date={info.getValue()} />
          </Value>
        ),
      }),
      columnHelper.display({
        id: "snapshot",
        header: () => <Label variant="medium">SNAPSHOT</Label>,
        meta: {
          className: classes.snapshot,
        },
        cell: (info) => {
          const block = info.row.original;
          const snapshot = snapshotLookupByBlockId.get(block.id);
          return (
            <Value>
              {snapshot?.description ?? "-"}
              {snapshot && (
                <SimpleButton
                  style={{ marginLeft: 5 }}
                  onClick={() => revertToBlock(block.id)}
                >
                  <SnapshotIcon />
                </SimpleButton>
              )}
            </Value>
          );
        },
      }),
    ],
    [snapshotLookupByBlockId]
  );

  return (
    <Table<DecoratedPollingEntity<Block>>
      isInitialLoading={firstFetch}
      data={filteredData}
      columns={columns}
      renderCustomHeader={(headerGroup) => (
        <Card
          className={classNames(
            tableClasses.tableRow,
            classes.tableRow,
            tableClasses.headerRow
          )}
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
        <>
          <Card
            className={classNames(tableClasses.tableRow, classes.tableRow)}
            key={row.id}
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
        </>
      )}
    />
  );
};

export default Main;
