import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { SizedBox } from "../SizedBox/SizedBox";
import classNames from "classnames";
import { useWorkspaceManager } from "../../../contexts/workspace.context";
import { buildProjectUrl, ProjectLink } from "../../links/ProjectLink";
import { FlowserIcon } from "../../icons/FlowserIcon";
import { useCurrentWorkspaceId } from "../../../hooks/use-current-project-id";
import { useMatches } from "../../../contexts/navigation.context";

type SideNavigationProps = {
  className?: string;
};

export function SideNavigation(props: SideNavigationProps): ReactElement {
  const { closeWorkspace } = useWorkspaceManager();

  return (
    <div className={classNames(classes.root, props.className)}>
      <div className={classes.linksWrapper}>
        <SizedBox height={0} />
        <FlowserIcon.Logo width={50} height={50} />
        <SizedBox height={30} />
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
      <div className={classes.linksWrapper}>
        <Link to="/settings" name="Settings" icon={FlowserIcon.Settings} />
        <Link
          to="/"
          name="Exit"
          icon={FlowserIcon.Exit}
          onClick={closeWorkspace}
        />
        <SizedBox height={0} />
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
  const projectId = useCurrentWorkspaceId();
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
