import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { useNavigation } from "../../../hooks/use-navigation";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../../hooks/use-search";
import { useFilterData } from "../../../hooks/use-filter-data";
import NoResults from "../../../components/no-results/NoResults";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetPollingContracts } from "../../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import Table from "../../../components/table/Table";
import { AccountContract } from "@flowser/shared";

// CONTRACTS TABLE
const columnHelper =
  createColumnHelper<DecoratedPollingEntity<AccountContract>>();

const columns = [
  columnHelper.accessor("name", {
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/contracts/details/${info.row.original.id}`}>
          {info.row.original.name}
        </NavLink>
      </Value>
    ),
  }),
  columnHelper.accessor("accountAddress", {
    header: () => <Label variant="medium">ACCOUNT</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
];

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, firstFetch } = useGetPollingContracts();
  const { filteredData } = useFilterData(data, searchTerm);

  useEffect(() => {
    setPlaceholder("search for contracts");
    showNavigationDrawer(false);
    showSubNavigation(true);
  }, []);

  return (
    <>
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
      {filteredData.length > 0 && (
        <Table<DecoratedPollingEntity<AccountContract>>
          columns={columns}
          data={data}
        />
      )}
    </>
  );
};

export default Main;
