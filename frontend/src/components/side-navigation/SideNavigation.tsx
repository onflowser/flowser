import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { useMatches } from "react-router-dom";
import { FlowserIcon } from "components/icons/Icons";
import { SizedBox } from "../sized-box/SizedBox";
import classNames from "classnames";
import { useProjectActions } from "../../contexts/project.context";
import { buildProjectUrl, ProjectLink } from "../link/ProjectLink";
import { useGetCurrentProject } from "../../hooks/use-api";

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
        <Link to="/accounts" icon={FlowserIcon.Account} />
        <Link to="/blocks" icon={FlowserIcon.Block} />
        <Link to="/transactions" icon={FlowserIcon.Transaction} />
        <Link to="/contracts" icon={FlowserIcon.Contract} />
        <Link to="/events" icon={FlowserIcon.Star} />
        <Link to="/interactions" icon={FlowserIcon.CursorClick} />
        <Link to="/settings" icon={FlowserIcon.Settings} />
      </div>
      <Link to="/" icon={FlowserIcon.Switch} onClick={switchProject} />
    </div>
  );
}

function FlowserLogo() {
  const size = 50;
  return <FlowserIcon.LogoRound width={size} height={size} />;
}

function Link(props: {
  to: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}) {
  const { data } = useGetCurrentProject();
  const fullTargetUrl = buildProjectUrl({
    projectId: data!.project!.id,
    subPath: props.to,
  });
  const matches = useMatches();
  const isActive = matches.some((match) => match.pathname === fullTargetUrl);
  const Icon = props.icon;
  const iconSize = 20;

  return (
    <ProjectLink
      to={props.to}
      className={classNames(classes.inactiveLink, {
        [classes.activeLink]: isActive,
      })}
      onClick={props.onClick}
    >
      <Icon width={iconSize} height={iconSize} />
    </ProjectLink>
  );
}
