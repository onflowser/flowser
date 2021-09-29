import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';
import { useTimeoutPolling } from '../../shared/hooks/timeout-polling';

import classes from './Blocks.module.scss';
import { useFilterData } from '../../shared/hooks/filter-data';

const Blocks = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { data } = useTimeoutPolling('/api/blocks/polling');
    const { filteredData } = useFilterData(data, searchTerm);

    useEffect(() => {
        setPlaceholder('Search blocks');
    }, []);

    useEffect(() => {
        console.log('filtered data changed', filteredData);
    }, [filteredData]);

    return (
        <div>
            <h2>Blocks</h2>
            <p>Search term: {searchTerm}</p>
            {data && <p>Data length: {data?.length}</p>}
            {filteredData && <p>Filtered data length: {filteredData?.length}</p>}

            <div className={classes.listContainer}>
                {filteredData &&
                    filteredData.length &&
                    filteredData.map((d: any, index: number) => (
                        <span key={index} className={`${d.isNew ? classes.newItem : ''}`}>
                            ID: {d.id}
                            <br />
                            Parent ID: {d.parentId} <br />
                            Timestamp: {d.timestamp} <br />
                            Height: {d.height} <br />
                        </span>
                    ))}
            </div>
        </div>
    );
};

export default Blocks;
