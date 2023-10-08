import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { useMatches } from "react-router-dom";
import { FlowserIcon } from "packages/ui/src/components/icons/FlowserIcon";
import { SizedBox } from "../SizedBox/SizedBox";
import classNames from "classnames";
import { useProjectManager } from "../../../contexts/projects.context";
import { buildProjectUrl, ProjectLink } from "../../links/ProjectLink";
import { useCurrentProjectId } from "frontend/src/hooks/use-current-project-id";

type SideNavigationProps = {
  className?: string;
};

// TODO(restructure): Move this to app folder
export function SideNavigation(props: SideNavigationProps): ReactElement {
  const { switchProject } = useProjectManager();

  return (
    <div className={classNames(classes.root, props.className)}>
      <div>
        <FlowserIcon.Logo width={50} height={50} />
        <SizedBox height={50} />
        <Link
          to="/interactions"
          name="Interactions"
          icon={FlowserIcon.CursorClick}
        />
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
