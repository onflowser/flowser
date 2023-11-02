import classes from "./ErrorMessage.module.scss";
import React, { ReactElement } from "react";
import classNames from "classnames";

export type MessageProps = {
  title: string;
  description?: string;
  className?: string;
};

export function Message({
  title,
  description,
  className,
}: MessageProps): ReactElement {
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.innerWrapper}>
        <span className={classes.title}>{title}</span>
        {description && (
          <span className={classes.description}>{description}</span>
        )}
      </div>
    </div>
  );
}
