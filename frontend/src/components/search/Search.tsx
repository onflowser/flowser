import React, { FunctionComponent, useCallback } from "react";
import { useSearch } from "../../hooks/use-search";
import classes from "./Search.module.scss";
import SearchIcon from "../../assets/icons/search.svg";
import CancelIcon from "../../assets/icons/cancel.svg";

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

  return (
    <div
      className={`${classes.root} ${className} ${
        searchDisabled && classes.disabled
      }`}
    >
      <input
        type="text"
        onChange={onSearchChange}
        value={searchTerm}
        placeholder={placeholder}
        disabled={searchDisabled}
      />
      {searchTerm ? (
        <CancelIcon
          className={`${classes.cancelIcon}`}
          onClick={clearSearchState}
        />
      ) : (
        <SearchIcon />
      )}
    </div>
  );
};

export default Search;
