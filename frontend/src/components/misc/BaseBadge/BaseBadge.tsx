import classNames from "classnames";
import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./BaseBadge.module.scss";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export const BaseBadge: FunctionComponent<BadgeProps> = ({
  className,
  children,
  ...restProps
}) => {
  return (
    <span {...restProps} className={classNames(classes.root, className)}>
      {children}
    </span>
  );
};
