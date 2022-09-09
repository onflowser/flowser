import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./ProjectItemBadge.module.scss";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export const ProjectItemBadge: FunctionComponent<BadgeProps> = ({
  className,
  children,
}) => {
  return <span className={`${classes.root} ${className}`}>{children}</span>;
};
