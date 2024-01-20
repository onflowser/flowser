import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./JsonView.module.scss";
import ReactJson from "@microlink/react-json-view"

type JsonViewProps = {
  className?: string;
  name: string;
  data: Record<string, unknown>;
  collapseAtDepth?: number;
};

export function JsonView(props: JsonViewProps): ReactElement {
  return (
    <div className={classNames(classes.root, props.className)}>
      <ReactJson
        name={props.name}
        style={{ backgroundColor: "none" }}
        theme="ashes"
        collapsed={props.collapseAtDepth ?? 4}
        src={props.data}
        displayObjectSize={true}
        enableClipboard={true}
        displayDataTypes={false}
      />
    </div>
  );
}
