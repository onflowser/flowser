import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Card.module.scss";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: "blue" | "black";
  active?: boolean;
  loading?: boolean;
  loadingText?: string;
};

const Card: FunctionComponent<CardProps> = ({
  children,
  className,
  variant = "blue",
  active = false,
  loading = false,
  loadingText = "Loading ...",
  ...restProps
}) => {
  return (
    <div
      className={`${classes.root} ${classes[variant]} ${
        active ? classes.active : ""
      } ${className}`}
      {...restProps}
    >
      {loading && <span className={classes.loading}>{loadingText}</span>}
      {children}
    </div>
  );
};

export default Card;
