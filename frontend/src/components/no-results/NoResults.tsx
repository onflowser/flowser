import React, { FunctionComponent } from "react";
import { ReactComponent as NoResultsIcon } from "../../assets/icons/no-results.svg";
import classes from "./NoResults.module.scss";

type NoResultsProps = {
  className?: string;
};

const NoResults: FunctionComponent<NoResultsProps> = ({ className }) => {
  return (
    <div className={`${classes.root} ${className}`}>
      <NoResultsIcon />
      <h3>It looks like there is nothing here.</h3>
      <p>No results found</p>
    </div>
  );
};

export default NoResults;
