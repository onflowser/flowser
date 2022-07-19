import React, { FunctionComponent } from "react";
import classes from "./Card.module.scss";

interface OwnProps {
  children?: any;
  className?: any;
  variant?: "blue" | "black";
  active?: boolean;
  loading?: boolean;
  loadingText?: string;
  [key: string]: any;
}

type Props = OwnProps;

const Card: FunctionComponent<Props> = ({
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
