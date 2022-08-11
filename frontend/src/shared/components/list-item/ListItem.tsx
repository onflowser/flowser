import React, { FunctionComponent } from "react";
import classes from "./ListItem.module.scss";

type ListItemProps = {
  isNew: boolean;
};

const ListItem: FunctionComponent<ListItemProps> = ({ isNew, children }) => {
  return (
    <span className={`${isNew ? classes.listItem__new : classes.listItem}`}>
      {children}
    </span>
  );
};

export default ListItem;
