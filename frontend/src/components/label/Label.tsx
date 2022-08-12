import React, { FunctionComponent } from "react";
import classes from "./Label.module.scss";

type LabelProps = {
  className?: string;
  variant?: "small" | "normal" | "medium" | "large" | "xlarge";
  title?: string;
};

const Label: FunctionComponent<LabelProps> = ({
  children,
  className,
  variant = "normal",
  title = "",
}) => {
  return (
    <span
      className={`${classes.root} ${classes[variant]} ${className}`}
      title={title}
    >
      {children}
    </span>
  );
};

export default Label;
