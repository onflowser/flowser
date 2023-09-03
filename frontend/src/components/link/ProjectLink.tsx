import React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { useGetCurrentProject } from "../../hooks/use-api";
import { ReactElement } from "react";

type ProjectLinkProps = NavLinkProps;

export function ProjectLink(props: ProjectLinkProps): ReactElement {
  const { data: currentProject } = useGetCurrentProject();
  const { to, ...otherProps } = props;
  return (
    <NavLink
      {...otherProps}
      to={`/projects/${currentProject?.project?.id}${to}`}
    />
  );
}
