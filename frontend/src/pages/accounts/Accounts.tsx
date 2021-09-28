import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';

const Accounts = () => {
    const { searchTerm, setPlaceholder } = useSearch();

    useEffect(() => {
        setPlaceholder('Search accounts');
    }, []);

    return (
        <div>
            <h2>Accounts</h2>
            <span>Search value: {searchTerm}</span>
        </div>
    );
};

export default Accounts;
