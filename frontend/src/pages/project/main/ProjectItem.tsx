import React, { FunctionComponent, ReactElement } from "react";
import classes from "./ProjectItem.module.scss";
import { ProjectItemBadge } from "./ProjectItemBadge";

type ProjectItemProps = {
  title: ReactElement | string;
  footer: ReactElement | string;
};

export const ProjectItem: FunctionComponent<ProjectItemProps> = ({
  title,
  footer,
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.main}>
        <div className={classes.title}>{title}</div>
        <div>
          <ProjectItemBadge>Revert</ProjectItemBadge>
        </div>
      </div>
      <div className={classes.timestamp}>{footer}</div>
    </div>
  );
};
