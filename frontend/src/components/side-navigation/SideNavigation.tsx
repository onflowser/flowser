import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { useMatches } from "react-router-dom";
import { FlowserIcon } from "components/icons/Icons";
import { SizedBox } from "../sized-box/SizedBox";
import classNames from "classnames";
import { useProjectActions } from "../../contexts/project.context";
import { buildProjectUrl, ProjectLink } from "../links/ProjectLink";
import { useCurrentProjectId } from "hooks/use-current-project-id";
import { Tooltip } from "../tooltips/Tooltip";

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
        <Link
          to="/interactions"
          name="Interactions"
          icon={FlowserIcon.CursorClick}
        />
        <SizedBox height={20} />
        <Link to="/accounts" name="Accounts" icon={FlowserIcon.Account} />
        <Link to="/blocks" name="Blocks" icon={FlowserIcon.Block} />
        <Link
          to="/transactions"
          name="Transactions"
          icon={FlowserIcon.Transaction}
        />
        <Link to="/contracts" name="Contracts" icon={FlowserIcon.Contract} />
        <Link to="/events" name="Events" icon={FlowserIcon.Star} />
      </div>
      <div>
        <Link to="/settings" name="Settings" icon={FlowserIcon.Settings} />
        <Link
          to="/"
          name="Exit"
          icon={FlowserIcon.Exit}
          onClick={switchProject}
        />
      </div>
    </div>
  );
}

function FlowserLogo() {
  const size = 50;
  return <FlowserIcon.LogoRound width={size} height={size} />;
}

function Link(props: {
  to: string;
  name: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}) {
  const projectId = useCurrentProjectId();
  const fullTargetUrl = buildProjectUrl({
    projectId,
    subPath: props.to,
  });
  const matches = useMatches();
  const isActive = matches.some((match) => match.pathname === fullTargetUrl);
  const Icon = props.icon;
  const iconSize = 20;

  return (
    <Tooltip content={props.name}>
      <ProjectLink
        to={props.to}
        className={classNames(classes.inactiveLink, {
          [classes.activeLink]: isActive,
        })}
        onClick={props.onClick}
      >
        <Icon width={iconSize} height={iconSize} />
      </ProjectLink>
    </Tooltip>
  );
}
