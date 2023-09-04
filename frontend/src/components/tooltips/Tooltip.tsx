import React, { createRef, ReactElement, ReactNode } from "react";
import { PlacesType } from "react-tooltip";
import { FlowserMenu } from "../menus/Menu";
import { MenuInstance, MenuItem } from "@szhsin/react-menu";

type TooltipProps = {
  content: string;
  children: ReactNode;
  position?: PlacesType;
};

export function Tooltip(props: TooltipProps): ReactElement {
  const menuRef = createRef<MenuInstance>();

  return (
    <FlowserMenu
      instanceRef={menuRef}
      menuButton={
        <div
          onMouseEnter={() => menuRef.current?.openMenu()}
          onMouseLeave={() => menuRef.current?.closeMenu()}
        >
          {props.children}
        </div>
      }
      direction="right"
      align="center"
    >
      <MenuItem>{props.content}</MenuItem>
    </FlowserMenu>
  );
}
