import React, { FunctionComponent } from "react";
import { useSearch } from "../../hooks/use-search";
import { SearchInput } from "../search-input/SearchInput";

export type SearchProps = {
  className?: string;
  context?: string;
};

/**
 * @deprecated Will be removed in the future.
 * Use `SearchInput` component instead.
 */
const Search: FunctionComponent<SearchProps> = ({
  className,
  context = "default",
}) => {
  const { searchTerm, setSearchTerm, placeholder } = useSearch(context);

  return (
    <SearchInput
      className={className}
      placeholder={placeholder}
      searchTerm={searchTerm}
      onChangeSearchTerm={setSearchTerm}
    />
  );
};

export default Search;
