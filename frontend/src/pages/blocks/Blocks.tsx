import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';

const Blocks = () => {
    const { term, setPlaceholder } = useSearch();

    useEffect(() => {
        setPlaceholder('Search blocks');
    }, []);

    return (
        <div>
            <h2>Blocks</h2>
            <p>Search term: {term}</p>
        </div>
    );
};

export default Blocks;
