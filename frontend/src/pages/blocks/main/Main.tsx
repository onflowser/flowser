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
import { isInitialParentId } from "../../../utils/common";
import { useGetPollingBlocks } from "../../../hooks/use-api";

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { formatDate } = useFormattedDate();
  const { data: blocks, firstFetch } = useGetPollingBlocks();
  // TODO: some items only include isUpdated and isNew fields
  const { filteredData } = useFilterData(blocks, searchTerm);

  useEffect(() => {
    setPlaceholder("Search for block ids, parent ids, time, ...");
    showNavigationDrawer(false);
    showSubNavigation(true);
    disableSearchBar(false);
  }, []);

  return (
    <>
      {filteredData.map((item) => (
        <Card
          key={item.height + item.id}
          className={`${classes.card} ${item.isNew ? classes.isNew : ""}`}
        >
          <div>
            <Label>BLOCK HEIGHT</Label>
            <Value>{item.height}</Value>
          </div>
          <div>
            <Label>BLOCK ID</Label>
            <Value>
              <NavLink to={`/blocks/details/${item.id}`}>
                <Ellipsis className={classes.hash}>{item.id}</Ellipsis>
              </NavLink>
            </Value>
          </div>
          <div>
            <Label>PARENT ID</Label>
            <Value>
              {isInitialParentId(item.parentId) ? (
                <Ellipsis className={classes.hash}>{item.parentId}</Ellipsis>
              ) : (
                <NavLink to={`/blocks/details/${item.parentId}`}>
                  <Ellipsis className={classes.hash}>{item.parentId}</Ellipsis>
                </NavLink>
              )}
            </Value>
          </div>
          <div>
            <Label>TIME</Label>
            <Value>{formatDate(item.timestamp)}</Value>
          </div>
          <div>
            <Label>COLLECTION GUARANTEES</Label>
            <Value>{item.collectionGuarantees?.length}</Value>
          </div>
          <div>
            <Label>BLOCK SEALS</Label>
            <Value>{item.blockSeals?.length}</Value>
          </div>
          <div>
            <Label>SIGNATURES</Label>
            <Value>{item.signatures?.length}</Value>
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
