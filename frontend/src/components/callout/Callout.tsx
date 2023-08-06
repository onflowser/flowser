import React, { ReactElement, ReactNode } from "react";
import classes from "./Callout.module.scss";

type CalloutProps = {
  icon?: ReactNode;
  title: string;
  description: string | ReactNode;
};

export function Callout(props: CalloutProps): ReactElement {
  const { icon, title, description } = props;
  return (
    <div className={classes.root}>
      <div>
        {icon} <b>{title}</b>
      </div>
      <div>{description}</div>
    </div>
  );
}
