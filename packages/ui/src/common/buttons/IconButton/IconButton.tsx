import React, { FunctionComponent, ReactElement } from "react";
import Button, { ButtonProps } from "../Button/Button";
import classes from "./IconButton.module.scss";
import classNames from "classnames";

interface IconButtonProps extends ButtonProps {
  icon: ReactElement;
  iconPosition?: "before" | "after" | "after-end";
}

const IconButton: FunctionComponent<IconButtonProps> = ({
  icon,
  iconPosition = "before",
  ...restProps
}) => {
  let children = icon;
  if (restProps.children) {
    if (iconPosition === "before") {
      children = (
        <span className={classes.before}>
          {icon} {restProps.children}
        </span>
      );
    } else if (iconPosition === "after-end") {
      children = (
        <span className={classes.afterEnd}>
          {restProps.children} {icon}
        </span>
      );
    } else {
      children = (
        <span className={classes.after}>
          {restProps.children} {icon}
        </span>
      );
    }
  }
  return (
    <Button
      {...restProps}
      className={classNames(classes.root, restProps.className)}
    >
      {children}
    </Button>
  );
};

export default IconButton;
