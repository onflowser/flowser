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
import { useGetPollingAccounts } from "../../../shared/hooks/api";

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
