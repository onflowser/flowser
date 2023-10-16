import React, { CSSProperties, ReactNode } from "react";
import classes from "./Value.module.scss";
import classNames from "classnames";

type ValueVariant = "small" | "normal" | "medium" | "large";

type ValueProps = {
  className?: string;
  style?: CSSProperties;
  variant?: ValueVariant;
  children: ReactNode;
};

function Value({ children, className, style, variant = "normal" }: ValueProps) {
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
}

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
