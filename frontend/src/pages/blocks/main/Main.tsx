import React, { FunctionComponent, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useFormattedDate } from "../../../shared/hooks/formatted-date";
import { useFilterData } from "../../../shared/hooks/filter-data";
import { useSearch } from "../../../shared/hooks/search";
import Card from "../../../shared/components/card/Card";
import Label from "../../../shared/components/label/Label";
import Value from "../../../shared/components/value/Value";
import classes from "./Main.module.scss";
import Ellipsis from "../../../shared/components/ellipsis/Ellipsis";
import { useNavigation } from "../../../shared/hooks/navigation";
import { useTimeoutPolling } from "../../../shared/hooks/timeout-polling";
import NoResults from "../../../shared/components/no-results/NoResults";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import { isInitialParentId } from "../../../shared/functions/utils";

const Main: FunctionComponent<any> = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { formatDate } = useFormattedDate();
  // TODO(milestone-2): fix types
  const { data: transactions, firstFetch } = useTimeoutPolling<any>(
    "/api/blocks/polling",
    "id"
  );

  useEffect(() => {
    setPlaceholder("Search for block ids, parent ids, time, ...");
    showNavigationDrawer(false);
    showSubNavigation(true);
    disableSearchBar(false);
  }, []);

  const { filteredData } = useFilterData(transactions, searchTerm);

  // TODO: some items only include isUpdated and isNew fields
  console.log(filteredData.filter((e: any) => !e.signatures));

  return (
    <>
      {filteredData &&
        filteredData.map((item: any) => (
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
                    <Ellipsis className={classes.hash}>
                      {item.parentId}
                    </Ellipsis>
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
