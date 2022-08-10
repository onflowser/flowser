import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import Card from "../../../shared/components/card/Card";
import Label from "../../../shared/components/label/Label";
import Value from "../../../shared/components/value/Value";
import { useNavigation } from "../../../shared/hooks/navigation";
import { NavLink } from "react-router-dom";
import { useSearch } from "../../../shared/hooks/search";
import { useFilterData } from "../../../shared/hooks/filter-data";
import NoResults from "../../../shared/components/no-results/NoResults";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import { useGetPollingContracts } from "../../../shared/hooks/api";

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
