import React, { FunctionComponent } from "react";
import classes from "./Content.module.scss";

interface OwnProps {
  children?: any;
  className?: any;
  [key: string]: any;
}

type Props = OwnProps;

const Content: FunctionComponent<Props> = ({ children, className }) => {
  return (
    <div className={`${classes.contentContainer} ${className}`}>{children}</div>
  );
};

export default Content;
