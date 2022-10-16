import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./ProjectItemBadge.module.scss";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import classNames from "classnames";

export type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export const ProjectItemBadge: FunctionComponent<BadgeProps> = ({
  className,
  children,
  ...restProps
}) => {
  return (
    <SimpleButton
      className={classNames(classes.root, className)}
      {...restProps}
    >
      {children}
    </SimpleButton>
  );
};
