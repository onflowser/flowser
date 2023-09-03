import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { routes } from "../../constants/routes";
import { NavLink, useLocation } from "react-router-dom";
import { FlowserIcon } from "components/icons/Icons";
import { SizedBox } from "../sized-box/SizedBox";
import classNames from "classnames";
import { useGetCurrentProject } from "../../hooks/use-api";
import { useProjectActions } from "../../contexts/project.context";

type SideNavigationProps = {
  className?: string;
};

export function SideNavigation(props: SideNavigationProps): ReactElement {
  const { switchProject } = useProjectActions();
  const { data: currentProjectData } = useGetCurrentProject();
  const { project: currentProject } = currentProjectData ?? {};

  return (
    <div className={classNames(classes.root, props.className)}>
      <div>
        <FlowserLogo />
        <SizedBox height={50} />
        <ProjectLink to={routes.accounts} icon={FlowserIcon.Account} />
        <ProjectLink to={routes.blocks} icon={FlowserIcon.Block} />
        <ProjectLink to={routes.transactions} icon={FlowserIcon.Transaction} />
        <ProjectLink to={routes.contracts} icon={FlowserIcon.Contract} />
        <ProjectLink to={routes.events} icon={FlowserIcon.Star} />
        <ProjectLink to={routes.interactions} icon={FlowserIcon.CursorClick} />
        {currentProject && (
          <ProjectLink
            to={`/configure/${currentProject.id}`}
            icon={FlowserIcon.Settings}
          />
        )}
      </div>
      <ProjectLink
        to={routes.start}
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
        [classes.activeLink]: location.pathname === props.to,
      })}
      onClick={props.onClick}
    >
      <Icon width={iconSize} height={iconSize} />
    </NavLink>
  );
}
