import React, { FunctionComponent, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useFormattedDate } from "../../../hooks/use-formatted-date";
import { useFilterData } from "../../../hooks/use-filter-data";
import { useSearch } from "../../../hooks/use-search";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import classes from "./Main.module.scss";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import { useNavigation } from "../../../hooks/use-navigation";
import NoResults from "../../../components/no-results/NoResults";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetPollingBlocks } from "../../../hooks/use-api";
import { FlowUtils } from "../../../utils/flow-utils";
import { createColumnHelper } from "@tanstack/table-core";
import Table from "../../../components/table/Table";
import { DecoratedPollingEntity } from "frontend/src/hooks/use-timeout-polling";
import { Block } from "types/generated/entities/blocks";

const { formatDate } = useFormattedDate();

const columnHelper = createColumnHelper<DecoratedPollingEntity<Block>>();

// Specify table shape
const columns = [
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
  columnHelper.accessor("parentId", {
    header: () => <Label variant="medium">PARENT ID</Label>,
    cell: (info) => (
      <Value>
        {FlowUtils.isInitialBlockId(info.getValue()) ? (
          <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
        ) : (
          <NavLink to={`/blocks/details/${info.getValue()}`}>
            <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
          </NavLink>
        )}
      </Value>
    ),
  }),
  columnHelper.accessor("timestamp", {
    header: () => <Label variant="medium">TIME</Label>,
    cell: (info) => <Value>{formatDate(info.getValue())}</Value>,
  }),
  columnHelper.accessor("collectionGuarantees", {
    header: () => <Label variant="medium">COLLECTION GUARANTEES</Label>,
    cell: (info) => <Value>{info.getValue()?.length}</Value>,
  }),
  columnHelper.accessor("blockSeals", {
    header: () => <Label variant="medium">BLOCK SEALS</Label>,
    cell: (info) => <Value>{info.getValue()?.length}</Value>,
  }),
  columnHelper.accessor("signatures", {
    header: () => <Label variant="medium">SIGNATURES</Label>,
    cell: (info) => <Value>{info.getValue()?.length}</Value>,
  }),
];

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();

  const { data: blocks, firstFetch } = useGetPollingBlocks();
  const { filteredData } = useFilterData(blocks, searchTerm);

  useEffect(() => {
    setPlaceholder("Search for block ids, parent ids, time, ...");
    showNavigationDrawer(false);
    showSubNavigation(true);
    disableSearchBar(false);
  }, []);

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
