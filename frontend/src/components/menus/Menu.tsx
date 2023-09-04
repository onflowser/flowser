import React, { ReactElement } from "react";
import {
  Menu as ReactMenu,
  MenuProps as ReactMenuProps,
} from "@szhsin/react-menu";
import "./Menu.scss";

type MenuProps = ReactMenuProps;

export function FlowserMenu(props: MenuProps): ReactElement {
  return <ReactMenu {...props} />;
}
