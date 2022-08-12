import React, { FunctionComponent } from "react";
import classes from "./Value.module.scss";

type ValueProps = {
  className?: string;
  variant?: "small" | "normal" | "medium" | "large";
};

const Value: FunctionComponent<ValueProps> = ({
  children,
  className,
  variant = "normal",
}) => {
  return (
    <span className={`${classes.root} ${classes[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Value;
