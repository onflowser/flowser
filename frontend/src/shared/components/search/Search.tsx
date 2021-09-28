import React, { useCallback } from 'react';
import { useSearch } from '../../hooks/search';
import classes from './Search.module.scss';
import search from './search.svg';
import cancel from './cancel.svg';

const Search = () => {
    const { searchTerm, setSearchTerm, placeholder } = useSearch();

    const onSearchChange = useCallback((event) => {
        const term = event.target.value;
        setSearchTerm(term);
    }, []);

    const clearSearchState = useCallback(() => {
        setSearchTerm('');
    }, []);

    return (
        <div className={classes.search}>
            <input type="text" onChange={onSearchChange} value={searchTerm} placeholder={placeholder} />
            {searchTerm ? (
                <img src={cancel} alt="search" onClick={clearSearchState} />
            ) : (
                <img src={search} alt="search" />
            )}
        </div>
    );
};

export default Search;
