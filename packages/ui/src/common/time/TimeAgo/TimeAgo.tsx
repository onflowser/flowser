import ReactTimeAgo, { ReactTimeagoProps } from "react-timeago";
import React, { ReactElement } from "react";

export function TimeAgo(props: ReactTimeagoProps<any>): ReactElement {
  return <ReactTimeAgo {...props} style={{ whiteSpace: "nowrap" }} />;
}
