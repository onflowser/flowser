import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Card.module.scss";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: "blue" | "black";
  active?: boolean;
  loading?: boolean;
  showIntroAnimation?: boolean;
  loadingText?: string;
};

export const Card: FunctionComponent<CardProps> = ({
  children,
  className,
  variant = "blue",
  active = false,
  loading = false,
  loadingText = "Loading ...",
  showIntroAnimation,
  ...restProps
}) => {
  return (
    <div
      className={`${classes.root} ${classes[variant]} ${
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
