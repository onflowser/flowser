import React, { FunctionComponent } from "react";
import classes from "./SubNavigation.module.scss";
import Search from "../../../shared/components/search/Search";
import Card from "../../../shared/components/card/Card";

const SubNavigation: FunctionComponent<{ className: string }> = (props) => {
  return (
    <Card className={`${classes.container} ${props.className}`}>
      <Search className={classes.searchBox} />
    </Card>
  );
};

export default SubNavigation;
