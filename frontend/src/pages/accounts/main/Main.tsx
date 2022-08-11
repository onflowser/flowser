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
import { useGetPollingAccounts } from "../../../hooks/use-api";

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data: accounts, firstFetch } = useGetPollingAccounts();

  useEffect(() => {
    setPlaceholder("search for block numbers or tx hashes");
    showNavigationDrawer(false);
    showSubNavigation(true);
  }, []);

  useEffect(() => {
    disableSearchBar(!accounts.length);
  }, [accounts]);

  const { filteredData } = useFilterData(accounts, searchTerm);

  return (
    <>
      {filteredData &&
        filteredData.map((item) => (
          <Card
            key={item.address}
            className={`${classes.card} ${
              item.isNew || item.isUpdated ? classes.isNew : ""
            }`}
          >
            <div>
              <Label>ADDRESS</Label>
              <Value>
                <NavLink to={`/accounts/details/${item.address}`}>
                  {item.address}
                </NavLink>
              </Value>
            </div>
            <div>
              <Label>BALANCE</Label>
              <Value>{item.balance}</Value>
            </div>
            <div>
              <Label>KEY COUNT</Label>
              <Value>{item.keys?.length ?? 0}</Value>
            </div>
            <div>
              <Label>TX COUNT</Label>
              <Value>{item.transactions.length ?? 0}</Value>
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
