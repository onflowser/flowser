import React, { ReactElement, ReactNode } from "react";
import classes from "./Timeline.module.scss";

export type TimelineItem = {
  id: string;
  label: ReactNode;
};

type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline(props: TimelineProps): ReactElement {
  return (
    <div className={classes.root}>
      <div className={classes.line} />
      <ul>
        {props.items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
