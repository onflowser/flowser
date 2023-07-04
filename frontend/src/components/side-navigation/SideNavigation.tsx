import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { routes } from "../../constants/routes";
import { NavLink } from "react-router-dom";

export function SideNavigation(): ReactElement {
  return (
    <div className={classes.root}>
      <Link to={routes.accounts} />
      <Link to={routes.blocks} />
      <Link to={routes.transactions} />
      <Link to={routes.contracts} />
      <Link to={routes.events} />
      <Link to={routes.project} />
    </div>
  );
}

function Link(props: { to: string }) {
  return (
    <NavLink
      to={props.to}
      className={classes.inactivePage}
      activeClassName={classes.activePage}
    >
      TODO
    </NavLink>
  );
}
