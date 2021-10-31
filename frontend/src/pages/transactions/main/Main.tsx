import React, { FunctionComponent, useEffect } from 'react';
import classes from './Main.module.scss';
import { useNavigation } from '../../../shared/hooks/navigation';
import { useSearch } from '../../../shared/hooks/search';
import { useFilterData } from '../../../shared/hooks/filter-data';
import { useTimeoutPolling } from '../../../shared/hooks/timeout-polling';
import NoResults from '../../../shared/components/no-results/NoResults';
import FullScreenLoading from '../../../shared/components/fullscreen-loading/FullScreenLoading';
import TransactionListItem from '../../../shared/components/transaction-list-item/TransactionListItem';

const Main: FunctionComponent<any> = () => {
    const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const { data, firstFetch } = useTimeoutPolling('/api/transactions/polling', '_id');

    useEffect(() => {
        setPlaceholder('search for block numbers or tx hashes');
        showNavigationDrawer(false);
        showSubNavigation(true);
        disableSearchBar(!data.length);
    }, [data]);

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item: any, i) => (
                    <TransactionListItem
                        key={i}
                        id={item.id}
                        referenceBlockId={item.referenceBlockId}
                        statusCode={item.status.statusCode}
                        payer={item.payer}
                        proposer={item.proposalKey.address}
                    />
                ))}
            {!firstFetch && <FullScreenLoading />}
            {firstFetch && filteredData.length === 0 && <NoResults className={classes.noResults} />}
        </>
    );
};

export default Main;
