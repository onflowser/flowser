import React, { ReactElement } from "react";
import classes from "./SideNavigation.module.scss";
import { SizedBox } from "../SizedBox/SizedBox";
import classNames from "classnames";
import { useWorkspaceManager } from "../../../contexts/workspace.context";
import { buildProjectUrl, ProjectLink } from "../../links/ProjectLink/ProjectLink";
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
        <Link to="/interactions" icon={FlowserIcon.CursorClick} />
        <Link to="/accounts" icon={FlowserIcon.Account} />
        <Link to="/blocks" icon={FlowserIcon.Block} />
        <Link to="/transactions" icon={FlowserIcon.Transaction} />
        <Link to="/contracts" icon={FlowserIcon.Contract} />
        <Link to="/events" icon={FlowserIcon.Star} />
      </div>
      <div className={classes.linksWrapper}>
        <Link to="/settings" icon={FlowserIcon.Settings} />
        <Link to="/" icon={FlowserIcon.Exit} onClick={closeWorkspace} />
        <SizedBox height={0} />
      </div>
    </div>
  );
}

function Link(props: {
  to: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}) {
  const {icon: Icon, ...linkProps} = props;
  const projectId = useCurrentWorkspaceId();
  const fullTargetUrl = buildProjectUrl({
    projectId,
    subPath: props.to,
  });
  const matches = useMatches();
  const isActive = matches.some((match) => match.pathname === fullTargetUrl);
  const iconSize = 20;

  return (
    <ProjectLink
      className={classNames(classes.inactiveLink, {
        [classes.activeLink]: isActive,
      })}
      {...linkProps}
    >
      <Icon width={iconSize} height={iconSize} />
    </ProjectLink>
  );
}
