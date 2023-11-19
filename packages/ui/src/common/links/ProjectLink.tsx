import React, { ReactNode } from "react";
import { ReactElement } from "react";
import { useCurrentWorkspaceId } from "../../hooks/use-current-project-id";
import { useNavigate } from "../../contexts/navigation.context";

type ProjectLinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
};

export function ProjectLink(props: ProjectLinkProps): ReactElement {
  const projectId = useCurrentWorkspaceId();
  const navigate = useNavigate()
  const { to, ...otherProps } = props;

  // TODO(web-mvp): Update styles
  return (
    <div
      {...otherProps}
      onClick={() => navigate(buildProjectUrl({
        projectId,
        subPath: to,
      }))}
    />
  );
}

export function buildProjectUrl(options: {
  projectId: string;
  subPath: string;
}): string {
  return `/projects/${options.projectId}${options.subPath}`;
}
