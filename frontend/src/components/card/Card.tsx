import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Card.module.scss";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: "table-line" | "black" | "header-row" | "dark-blue";
  active?: boolean;
  loading?: boolean;
  showIntroAnimation?: boolean;
  loadingText?: string;
};

const Card: FunctionComponent<CardProps> = ({
  children,
  className,
  variant = "dark-blue",
  active = false,
  loading = false,
  loadingText = "Loading ...",
  showIntroAnimation,
  ...restProps
}) => {
  return (
    <div
      className={`${classes.root} ${classes[variant]} ${
        // TODO: fix the possibly undefined index "variant"
        active ? classes.active : ""
      } ${className} ${showIntroAnimation ? classes.introAnimation : ""}`}
      {...restProps}
    >
      {loading && <span className={classes.loading}>{loadingText}</span>}
      {children}
    </div>
  );
};

export default Card;
