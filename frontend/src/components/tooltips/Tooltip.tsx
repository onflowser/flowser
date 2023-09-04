import React, { ReactElement, ReactNode, useState } from "react";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import { Menu, MenuDivider, MenuItem } from "@szhsin/react-menu";

type TooltipProps = {
  content: string;
  children: ReactElement;
};

export function Tooltip(props: TooltipProps): ReactElement {
  return (
    <Menu menuButton={() => props.children} direction="right">
      <MenuItem>{props.content}</MenuItem>
      <MenuItem>{props.content}</MenuItem>
    </Menu>
  );
}
