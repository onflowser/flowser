import React, { ReactElement } from "react";
import classes from "./ProjectItem.module.scss";
import { ProjectItemBadge } from "./ProjectItemBadge";

type ProjectItemProps = {
  content: { title: ReactElement | string; timestamp: ReactElement | string };
};

export const ProjectItem = ({ content }: ProjectItemProps) => {
  return (
    <div className={classes.item}>
      <div className={classes.main}>
        <div className={classes.title}>{content.title}</div>
        <div>
          <ProjectItemBadge>Revert</ProjectItemBadge>
        </div>
      </div>
      <div className={classes.timestamp}>{content.timestamp}</div>
    </div>
  );
};
