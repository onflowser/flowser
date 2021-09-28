import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';
import { useTimeoutPolling } from '../../shared/hooks/timeout-polling';

import classes from './Blocks.module.scss';

const Blocks = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { data } = useTimeoutPolling('/api/blocks/polling');

    useEffect(() => {
        setPlaceholder('Search blocks');
    }, []);

    return (
        <div>
            <h2>Blocks</h2>
            <p>Search term: {searchTerm}</p>
            {data && <p>Data length: {data?.length}</p>}

            <div className={classes.listContainer}>
                {data &&
                    data.length &&
                    data.map((d: any, index: number) => (
                        <span key={index} className={`${d.isNew ? classes.newItem : ''}`}>
                            {d.id}
                        </span>
                    ))}
            </div>
        </div>
    );
};

export default Blocks;
