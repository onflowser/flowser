import React, { ReactElement, ReactNode, useState } from "react";
import { PlacesType, Tooltip as ReactTooltip } from "react-tooltip";

type TooltipProps = {
  content: string;
  children: ReactNode;
  position?: PlacesType;
};

export function Tooltip(props: TooltipProps): ReactElement {
  const [id] = useState(String(Math.random() * 10000));

  return (
    <>
      <ReactTooltip id={id} style={{ backgroundColor: "#272B32" }} />

      <div
        data-tooltip-id={id}
        data-tooltip-content={props.content}
        data-tooltip-place={props.position}
      >
        {props.children}
      </div>
    </>
  );
}
