import React, { CSSProperties, FunctionComponent } from "react";
import classes from "./Value.module.scss";
import classNames from "classnames";

type ValueVariant = "small" | "normal" | "medium" | "large";

type ValueProps = {
  className?: string;
  style?: CSSProperties;
  variant?: ValueVariant;
};

export const Value: FunctionComponent<ValueProps> = ({
  children,
  className,
  style,
  variant = "normal",
}) => {
  return (
    <span
      style={style}
      className={classNames(
        classes.root,
        getClassForVariant(variant),
        className
      )}
    >
      {children}
    </span>
  );
};

function getClassForVariant(variant: ValueVariant) {
  switch (variant) {
    case "medium":
      return classes.medium;
    case "large":
      return classes.large;
    case "normal":
    case "small":
    default:
      return "";
  }
}

export default Value;
