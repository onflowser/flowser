import React, { FunctionComponent } from "react";
import classes from "./SubNavigation.module.scss";
import Search from "../search/Search";
import Card from "../card/Card";

const SubNavigation: FunctionComponent<{ className: string }> = (props) => {
  return (
    <Card className={`${classes.container} ${props.className}`}>
      <Search className={classes.searchBox} />
    </Card>
  );
};

export default SubNavigation;
