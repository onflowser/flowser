import React, { FunctionComponent, useCallback } from "react";
import { useSearch } from "../../hooks/use-search";
import classes from "./Search.module.scss";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import { ReactComponent as CancelIcon } from "../../assets/icons/cancel.svg";
import { useRef } from "react";

export type SearchProps = {
  className?: string;
  context?: string;
};

const Search: FunctionComponent<SearchProps> = ({
  className,
  context = "default",
}) => {
  const { searchTerm, setSearchTerm, placeholder, searchDisabled } =
    useSearch(context);

  const onSearchChange = useCallback((event) => {
    const term = event.target.value;
    setSearchTerm(term);
  }, []);

  const clearSearchState = useCallback(() => {
    setSearchTerm("");
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`${classes.root} ${className} ${
        searchDisabled && classes.disabled
      }`}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <SearchIcon className={classes.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        onChange={onSearchChange}
        value={searchTerm}
        placeholder={placeholder}
        disabled={searchDisabled}
      />
      {!!searchTerm && (
        <CancelIcon
          className={`${classes.cancelIcon}`}
          onClick={clearSearchState}
        />
      )}
    </div>
  );
};

export default Search;
