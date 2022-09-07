import React, { FunctionComponent } from "react";
import classes from "./Value.module.scss";
import classNames from "classnames";

type ValueVariant = "small" | "normal" | "medium" | "large";

type ValueProps = {
  className?: string;
  variant?: ValueVariant;
};

const Value: FunctionComponent<ValueProps> = ({
  children,
  className,
  variant = "normal",
}) => {
  return (
    <span
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
