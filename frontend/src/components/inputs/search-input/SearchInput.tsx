import classNames from "classnames";
import React, { ReactElement, useRef } from "react";
import classes from "./SearchInput.module.scss";
import { FlowserIcon } from "../../icons/Icons";

type SearchInputProps = {
  className?: string;
  placeholder?: string;
  searchTerm: string;
  onChangeSearchTerm: (searchTerm: string) => void;
};

export function SearchInput(props: SearchInputProps): ReactElement {
  const { className, placeholder, searchTerm, onChangeSearchTerm } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={classNames(classes.root, className)}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <FlowserIcon.Search className={classes.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        onChange={(e) => onChangeSearchTerm(e.target.value)}
        value={searchTerm}
        placeholder={placeholder}
      />
      {searchTerm !== "" && (
        <FlowserIcon.Cancel
          className={classes.cancelIcon}
          onClick={() => onChangeSearchTerm("")}
        />
      )}
    </div>
  );
}
