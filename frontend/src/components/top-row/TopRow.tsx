import React, { FunctionComponent } from "react";
import classes from "./TopRow.module.scss";
import Search from "../search/Search";

export const TopRow: FunctionComponent = () => {
  return (
    <div className={classes.root}>
      <div className={classes.rightContainer}>
        <Search className={classes.searchBox} />
      </div>
    </div>
  );
};
