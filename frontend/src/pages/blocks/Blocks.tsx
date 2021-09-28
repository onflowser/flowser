import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';

const Blocks = () => {
    const { searchTerm, setPlaceholder } = useSearch();

    useEffect(() => {
        setPlaceholder('Search blocks');
    }, []);

    return (
        <div>
            <h2>Blocks</h2>
            <p>Search term: {searchTerm}</p>
        </div>
    );
};

export default Blocks;
