import React, { ReactElement } from "react";
import ReactJson from "react-json-view";
import classes from "./JsonView.module.scss";

type JsonViewProps = {
  data: Record<string, unknown>;
};

export function JsonView(props: JsonViewProps): ReactElement {
  return (
    <div className={classes.root}>
      <ReactJson
        style={{ backgroundColor: "none" }}
        theme="ashes"
        collapsed={4}
        src={props.data}
      />
    </div>
  );
}
