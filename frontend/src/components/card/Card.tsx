import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Card.module.scss";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: "table-line" | "black" | "header-row" | "dark-blue";
  active?: boolean;
  showIntroAnimation?: boolean;
};

const Card: FunctionComponent<CardProps> = ({
  children,
  className,
  variant = "dark-blue",
  active = false,
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
      {children}
    </div>
  );
};

export default Card;
