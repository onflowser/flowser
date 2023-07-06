import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { routes } from "../../constants/routes";
import { NavLink } from "react-router-dom";
import { FlowserIcon } from "components/icons/Icons";
import { SizedBox } from "../sized-box/SizedBox";

export function SideNavigation(): ReactElement {
  return (
    <div className={classes.root}>
      <FlowserLogo />
      <SizedBox height={50} />
      <ProjectLink to={routes.accounts} icon={FlowserIcon.Account} />
      <ProjectLink to={routes.blocks} icon={FlowserIcon.Block} />
      <ProjectLink to={routes.transactions} icon={FlowserIcon.Transaction} />
      <ProjectLink to={routes.contracts} icon={FlowserIcon.Contract} />
      <ProjectLink to={routes.events} icon={FlowserIcon.Star} />
      <ProjectLink to={routes.interactions} icon={FlowserIcon.CursorClick} />
      <ProjectLink to={routes.project} icon={FlowserIcon.ArtistPalette} />
    </div>
  );
}

function FlowserLogo() {
  const size = 50;
  return <FlowserIcon.LogoRound width={size} height={size} />;
}

function ProjectLink(props: {
  to: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}) {
  const Icon = props.icon;
  const iconSize = 20;
  return (
    <NavLink
      to={props.to}
      className={classes.inactiveLink}
      activeClassName={classes.activeLink}
    >
      <Icon width={iconSize} height={iconSize} />
    </NavLink>
  );
}
