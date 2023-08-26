import React, { FunctionComponent, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
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
import { SimpleButton } from "../../../components/buttons/simple-button/SimpleButton";
import { ReactComponent as SnapshotIcon } from "../../../assets/icons/snapshot.svg";
import ReactTimeago from "react-timeago";
import { useProjectActions } from "../../../contexts/project.context";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Block>>();

const Main: FunctionComponent = () => {
  const { showNavigationDrawer } = useNavigation();
  const { checkoutBlock } = useProjectActions();

  const { data: blocks, firstFetch, error } = useGetPollingBlocks();
  const { data: emulatorSnapshots } = useGetPollingEmulatorSnapshots();
  const snapshotLookupByBlockId = useMemo(
    () =>
      new Map(
        emulatorSnapshots.map((snapshot) => [snapshot.blockId, snapshot])
      ),
    [emulatorSnapshots]
  );

  useEffect(() => {
    showNavigationDrawer(false);
  }, []);

  const columns = useMemo(
    () => [
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
      columnHelper.accessor("height", {
        header: () => <Label variant="medium">HEIGHT</Label>,
        meta: {
          className: classes.blockHeight,
        },
        cell: (info) => <Value>{info.getValue()}</Value>,
      }),
      columnHelper.accessor("timestamp", {
        header: () => <Label variant="medium">CREATED</Label>,
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
          const latestBlock = blocks[0];
          const isLatestBlock = latestBlock.height === block.height;
          const snapshot = snapshotLookupByBlockId.get(block.id);
          return (
            <Value>
              {!isLatestBlock && (
                <SimpleButton
                  style={{ marginRight: 10 }}
                  onClick={() => checkoutBlock(block.id)}
                >
                  <SnapshotIcon />
                </SimpleButton>
              )}
              {snapshot?.description}
            </Value>
          );
        },
      }),
    ],
    [snapshotLookupByBlockId, blocks, checkoutBlock]
  );

  return (
    <Table<DecoratedPollingEntity<Block>>
      isInitialLoading={firstFetch}
      error={error}
      data={blocks}
      columns={columns}
      headerRowClass={classes.tableRow}
      bodyRowClass={classes.tableRow}
    />
  );
};

export default Main;
