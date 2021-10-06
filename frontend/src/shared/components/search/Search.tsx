import React, { FunctionComponent, useCallback } from 'react';
import { useSearch } from '../../hooks/search';
import classes from './Search.module.scss';
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg';
import { ReactComponent as CancelIcon } from '../../assets/icons/cancel.svg';

interface SearchProps {
    className?: any;
}

type Props = SearchProps;

const Search: FunctionComponent<Props> = (props) => {
    const { searchTerm, setSearchTerm, placeholder } = useSearch();

    const onSearchChange = useCallback((event) => {
        const term = event.target.value;
        setSearchTerm(term);
    }, []);

    const clearSearchState = useCallback(() => {
        setSearchTerm('');
    }, []);

    return (
        <div className={`${classes.root} ${props.className}`}>
            <input type="text" onChange={onSearchChange} value={searchTerm} placeholder={placeholder} />
            {searchTerm ? (
                <CancelIcon className={`${classes.cancelIcon}`} onClick={clearSearchState} />
            ) : (
                <SearchIcon />
            )}
        </div>
    );
};

export default Search;
