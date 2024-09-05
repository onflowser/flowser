import React, { ReactNode } from "react";
import { ReactElement } from "react";
import { useCurrentWorkspaceId } from "../../../hooks/use-current-project-id";
import { useNavigate } from "../../../contexts/navigation.context";
import classNames from "classnames";
import classes from "./ProjectLink.module.scss";

type ProjectLinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function ProjectLink(props: ProjectLinkProps): ReactElement {
  const projectId = useCurrentWorkspaceId();
  const navigate = useNavigate()
  const { to, className, ...otherProps } = props;

  return (
    <div
      className={classNames(classes.root, className)}
      onClick={() => navigate(buildProjectUrl({
        projectId,
        subPath: to,
      }))}
      {...otherProps}
    />
  );
}

export function buildProjectUrl(options: {
  projectId: string;
  subPath: string;
}): string {
  return `/projects/${options.projectId}${options.subPath}`;
}
