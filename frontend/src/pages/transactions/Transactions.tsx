import React, { FunctionComponent, useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';
import { useTimeoutPolling } from '../../shared/hooks/timeout-polling';
import ListContainer from '../../shared/components/list-container/ListContainer';
import ListItem from '../../shared/components/list-item/ListItem';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Transactions: FunctionComponent<Props> = (props) => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { data } = useTimeoutPolling('/api/transactions/polling');

    useEffect(() => {
        setPlaceholder('Search transactions');
    }, []);

    return (
        <div>
            <h2>Transactions</h2>
            <p>Search term: {searchTerm}</p>
            {data && <p>Data length: {data?.length}</p>}

            <ListContainer>
                {data.map((d: any, index: number) => (
                    <ListItem isNew={d.isNew} key={index}>
                        {d.id}
                    </ListItem>
                ))}
            </ListContainer>
        </div>
    );
};

export default Transactions;
