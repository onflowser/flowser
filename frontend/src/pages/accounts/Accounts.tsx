import React, { useEffect } from 'react';
import { useSearch } from '../../shared/hooks/search';

const Accounts = () => {
    const { term, setPlaceholder } = useSearch();

    useEffect(() => {
        setPlaceholder('Search accounts');
    }, []);

    return (
        <div>
            <h2>Accounts</h2>
            <span>Search value: {term}</span>
        </div>
    );
};

export default Accounts;
