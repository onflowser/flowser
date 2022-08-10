import React, { FunctionComponent, useEffect } from "react";
import classes from "./Main.module.scss";
import { useNavigation } from "../../../shared/hooks/navigation";
import { useSearch } from "../../../shared/hooks/search";
import { useFilterData } from "../../../shared/hooks/filter-data";
import NoResults from "../../../shared/components/no-results/NoResults";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import TransactionListItem from "../../../shared/components/transaction-list-item/TransactionListItem";
import { useGetPollingTransactions } from "../../../shared/hooks/api";

const Main: FunctionComponent = () => {
  const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, firstFetch } = useGetPollingTransactions();
  const { filteredData } = useFilterData(data, searchTerm);

  useEffect(() => {
    setPlaceholder("search for block numbers or tx hashes");
    showNavigationDrawer(false);
    showSubNavigation(true);
    disableSearchBar(!data.length);
  }, [data]);

  return (
    <>
      {filteredData.map((item, i) => (
        <TransactionListItem
          key={item.id + i}
          className={`${item.isNew || item.isUpdated ? classes.isNew : ""}`}
          id={item.id}
          referenceBlockId={item.referenceBlockId}
          statusCode={item.status?.statusCode}
          payer={item.payer}
          proposer={item.proposalKey?.address ?? "-"}
        />
      ))}
      {!firstFetch && <FullScreenLoading />}
      {firstFetch && filteredData.length === 0 && (
        <NoResults className={classes.noResults} />
      )}
    </>
  );
};

export default Main;
