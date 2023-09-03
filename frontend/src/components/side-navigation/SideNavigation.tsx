import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { NavLink, useLocation } from "react-router-dom";
import { FlowserIcon } from "components/icons/Icons";
import { SizedBox } from "../sized-box/SizedBox";
import classNames from "classnames";
import { useProjectActions } from "../../contexts/project.context";

type SideNavigationProps = {
  className?: string;
};

export function SideNavigation(props: SideNavigationProps): ReactElement {
  const { switchProject } = useProjectActions();

  return (
    <div className={classNames(classes.root, props.className)}>
      <div>
        <FlowserLogo />
        <SizedBox height={50} />
        <ProjectLink to="accounts" icon={FlowserIcon.Account} />
        <ProjectLink to="blocks" icon={FlowserIcon.Block} />
        <ProjectLink to="transactions" icon={FlowserIcon.Transaction} />
        <ProjectLink to="contracts" icon={FlowserIcon.Contract} />
        <ProjectLink to="events" icon={FlowserIcon.Star} />
        <ProjectLink to="interactions" icon={FlowserIcon.CursorClick} />
        <ProjectLink to="settings" icon={FlowserIcon.Settings} />
      </div>
      <ProjectLink
        to="/projects"
        icon={FlowserIcon.Switch}
        onClick={switchProject}
      />
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
  onClick?: () => void;
}) {
  const location = useLocation();
  const Icon = props.icon;
  const iconSize = 20;
  return (
    <NavLink
      to={props.to}
      className={classNames(classes.inactiveLink, {
        [classes.activeLink]: location.pathname.endsWith(props.to),
      })}
      onClick={props.onClick}
    >
      <Icon width={iconSize} height={iconSize} />
    </NavLink>
  );
}
