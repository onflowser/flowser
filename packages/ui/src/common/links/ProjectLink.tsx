import React from "react";
import { NavLink, NavLinkProps, To } from "react-router-dom";
import { ReactElement } from "react";
import { useCurrentProjectId } from "../../../../../frontend/src/hooks/use-current-project-id";

type ProjectLinkProps = NavLinkProps;

// TODO(restructure): Move this to app folder?
export function ProjectLink(props: ProjectLinkProps): ReactElement {
  const projectId = useCurrentProjectId();
  const { to, ...otherProps } = props;
  return (
    <NavLink
      {...otherProps}
      to={buildProjectUrl({
        projectId,
        subPath: to,
      })}
    />
  );
}

export function buildProjectUrl(options: {
  projectId: string;
  subPath: To;
}): string {
  return `/projects/${options.projectId}${options.subPath}`;
}
