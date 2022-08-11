import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import { useNavigation } from "../../../hooks/use-navigation";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../../hooks/use-search";
import { useFilterData } from "../../../hooks/use-filter-data";
import NoResults from "../../../components/no-results/NoResults";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetPollingContracts } from "../../../hooks/use-api";

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
      {filteredData.map((item, i) => (
        <Card
          key={item.id + i}
          className={`${classes.card} ${
            item.isNew || item.isUpdated ? classes.isNew : ""
          }`}
        >
          <div>
            <Label>NAME</Label>
            <Value>
              <NavLink to={`/contracts/details/${item.id}`}>
                {item.name}
              </NavLink>
            </Value>
          </div>
          <div>
            <Label>ACCOUNT</Label>
            <Value>
              <NavLink to={`/accounts/details/${item.accountAddress}`}>
                {item.accountAddress}
              </NavLink>
            </Value>
          </div>
        </Card>
      ))}
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
    </>
  );
};

export default Main;
