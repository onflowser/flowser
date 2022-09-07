import React, { FunctionComponent, ReactElement } from "react";
import classes from "./ProjectItem.module.scss";

type ProjectItemProps = {
  title: ReactElement | string;
  footer: ReactElement | string;
  rightSection?: ReactElement | string;
};

export const ProjectItem: FunctionComponent<ProjectItemProps> = ({
  title,
  footer,
  rightSection,
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.main}>
        <div className={classes.title}>{title}</div>
        <div>{rightSection}</div>
      </div>
      <div className={classes.timestamp}>{footer}</div>
    </div>
  );
};
