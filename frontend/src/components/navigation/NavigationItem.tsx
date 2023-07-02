import React, { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";
import classes from "./NavigationItem.module.scss";

type NavigationItemProps = {
  to: string;
  totalCounter?: number;
  unreadCounter?: number;
  activeClassName?: string;
};

// TODO: Refactor & remove counters
const NavigationItem: FunctionComponent<NavigationItemProps> = ({
  to,
  children,
  totalCounter = "-",
  unreadCounter = null,
}) => {
  return (
    <div className={classes.root}>
      <NavLink
        to={to}
        className={classes.navLink}
        activeClassName={classes.active}
      >
        <span>{children}</span>
        <div className={classes.counters}>
          <div className={classes.totalCounter}>{totalCounter}</div>
          {unreadCounter && (
            <div className={classes.unreadCounter}>{unreadCounter}</div>
          )}
        </div>
      </NavLink>
    </div>
  );
};

export default NavigationItem;
