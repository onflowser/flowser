import React, { FunctionComponent, useCallback } from "react";
import { useSearch } from "../../hooks/search";
import classes from "./Search.module.scss";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";
import { ReactComponent as CancelIcon } from "../../assets/icons/cancel.svg";

interface SearchProps {
  className?: any;
  context?: string;
}

type Props = SearchProps;

const Search: FunctionComponent<Props> = ({
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
