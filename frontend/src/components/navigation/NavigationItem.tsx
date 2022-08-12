import React, { FunctionComponent, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import classes from "./NavigationItem.module.scss";

type NavigationItemProps = {
  to: string;
  icon?: ReactNode;
  counter?: number;
  activeClassName?: string;
};

const NavigationItem: FunctionComponent<NavigationItemProps> = ({
  to,
  children,
  icon,
  counter = 0,
}) => {
  return (
    <div className={classes.root}>
      <NavLink
        to={to}
        className={classes.navLink}
        activeClassName={classes.active}
      >
        <div>
          {icon && <div className={classes.iconWrapper}> {icon}</div>}
          <span>{children}</span>
        </div>
        <div>{counter}</div>
      </NavLink>
    </div>
  );
};

export default NavigationItem;
