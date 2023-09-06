import React, { ReactElement, ReactNode } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "./Tooltip.scss";
import { PopupPosition } from "reactjs-popup/dist/types";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode | string;
  position?: PopupPosition;
};

export function Tooltip(props: TooltipProps): ReactElement {
  return (
    <Popup
      trigger={() => <div>{props.children}</div>}
      position={props.position ?? "top center"}
      closeOnDocumentClick
      on="hover"
    >
      {props.content}
    </Popup>
  );
}
