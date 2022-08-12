import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Badge.module.scss";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

const Badge: FunctionComponent<BadgeProps> = ({
  className,
  children,
  ...restProps
}) => {
  return (
    <span {...restProps} className={`${classes.root} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
