import classNames from "classnames";
import React, { ReactElement } from "react";
import ReactJson from "react-json-view";
import classes from "./JsonView.module.scss";

type JsonViewProps = {
  className?: string;
  name: string;
  data: Record<string, unknown>;
};

export function JsonView(props: JsonViewProps): ReactElement {
  return (
    <div className={classNames(classes.root, props.className)}>
      <ReactJson
        name={props.name}
        style={{ backgroundColor: "none" }}
        theme="ashes"
        collapsed={4}
        src={props.data}
      />
    </div>
  );
}
