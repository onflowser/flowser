import React, { FunctionComponent, HTMLAttributes } from "react";
import classes from "./Content.module.scss";

type ContentProps = HTMLAttributes<HTMLDivElement>;

const Content: FunctionComponent<ContentProps> = ({
  children,
  className,
  ...restProps
}) => {
  return (
    <div {...restProps} className={`${classes.contentContainer} ${className}`}>
      {children}
    </div>
  );
};

export default Content;
