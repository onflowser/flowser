import React, { FunctionComponent, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useFilterData } from "../../../hooks/use-filter-data";
import { useSearch } from "../../../hooks/use-search";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import classes from "./Main.module.scss";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import { useNavigation } from "../../../hooks/use-navigation";
import { NoResults } from "../../../components/no-results/NoResults";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { createColumnHelper } from "@tanstack/table-core";
import Table from "../../../components/table/Table";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import { Block } from "@flowser/shared";
import {
  useGetPollingBlocks,
  useGetPollingEmulatorSnapshots,
} from "../../../hooks/use-api";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import { ReactComponent as SnapshotIcon } from "../../../assets/icons/snapshot.svg";
import ReactTimeago from "react-timeago";
import { useProjectActions } from "../../../contexts/project-actions.context";

const columnHelper = createColumnHelper<DecoratedPollingEntity<Block>>();

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
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
    disableSearchBar(false);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("height", {
        header: () => <Label variant="medium">BLOCK HEIGHT</Label>,
        cell: (info) => <Value>{info.getValue()}</Value>,
      }),
      columnHelper.accessor("id", {
        header: () => <Label variant="medium">BLOCK ID</Label>,
        cell: (info) => (
          <Value>
            <NavLink to={`/blocks/details/${info.getValue()}`}>
              <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
            </NavLink>
          </Value>
        ),
      }),
      columnHelper.accessor("blockSeals", {
        header: () => <Label variant="medium">BLOCK SEALS</Label>,
        cell: (info) => <Value>{info.getValue()?.length}</Value>,
      }),
      columnHelper.accessor("signatures", {
        header: () => <Label variant="medium">SIGNATURES</Label>,
        cell: (info) => <Value>{info.getValue()?.length}</Value>,
      }),
      columnHelper.accessor("timestamp", {
        header: () => <Label variant="medium">TIME</Label>,
        cell: (info) => (
          <Value>
            <ReactTimeago date={info.getValue()} />
          </Value>
        ),
      }),
      columnHelper.display({
        id: "snapshot",
        header: () => <Label variant="medium">SNAPSHOT</Label>,
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
    [filteredData, snapshotLookupByBlockId]
  );

  return (
    <>
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
      {filteredData.length > 0 && (
        <Table<DecoratedPollingEntity<Block>>
          columns={columns}
          data={filteredData}
        ></Table>
      )}
    </>
  );
};

export default Main;
