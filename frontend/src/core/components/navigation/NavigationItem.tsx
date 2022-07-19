import React, { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";
import classes from "./NavigationItem.module.scss";

interface OwnProps {
  to: string;
  children: any;
  icon?: any;
  counter?: number;

  [key: string]: any;
}

type Props = OwnProps;

const NavigationItem: FunctionComponent<Props> = ({
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
