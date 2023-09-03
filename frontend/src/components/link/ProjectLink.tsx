import React from "react";
import { NavLink, NavLinkProps, To } from "react-router-dom";
import { useGetCurrentProject } from "../../hooks/use-api";
import { ReactElement } from "react";

type ProjectLinkProps = NavLinkProps;

export function ProjectLink(props: ProjectLinkProps): ReactElement {
  const { data: currentProject } = useGetCurrentProject();
  const { to, ...otherProps } = props;
  return (
    <NavLink
      {...otherProps}
      to={buildProjectUrl({
        projectId: currentProject!.project!.id,
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
