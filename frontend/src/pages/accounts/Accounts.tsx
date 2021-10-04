import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';
import { useTimeoutPolling } from '../../shared/hooks/timeout-polling';
import ListContainer from '../../shared/components/list-container/ListContainer';
import ListItem from '../../shared/components/list-item/ListItem';

const Accounts = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { data } = useTimeoutPolling('/api/accounts/polling');

    useEffect(() => {
        setPlaceholder('Search accounts');
    }, []);

    return (
        <div>
            <h2>Accounts</h2>
            <p>Search term: {searchTerm}</p>
            {data && <p>Data length: {data?.length}</p>}

            <ListContainer>
                {data.map((d: any, index: number) => (
                    <ListItem isNew={d.isNew} key={index}>
                        {d.address}
                    </ListItem>
                ))}
            </ListContainer>
        </div>
    );
};

export default Accounts;
