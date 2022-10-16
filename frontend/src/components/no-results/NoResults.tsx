import classNames from "classnames";
import React, { FunctionComponent } from "react";
import classes from "./NoResults.module.scss";

type NoResultsProps = {
  className?: string;
};

export const NoResults: FunctionComponent<NoResultsProps> = ({ className }) => {
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.innerWrapper}>
        <span className={classes.title}>
          It looks like there is nothing here.
        </span>
        <span className={classes.description}>No results found</span>
      </div>
    </div>
  );
};
