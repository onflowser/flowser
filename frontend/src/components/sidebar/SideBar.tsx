import React from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import { NavLink } from "react-router-dom";
import classes from "./SideBar.module.scss";
import { ReactComponent as SettingsIcon } from "../../assets/icons/settings-circle.svg";
import { ReactComponent as ConnectIcon } from "../../assets/icons/connect-circle .svg";
import { ReactComponent as SwitchIcon } from "../../assets/icons/switch.svg";
import ColoredCircle from "components/colored-circle/ColoredCircle";

export type Sidebar = {
  toggled: boolean;
  toggleSidebar: () => void;
};

function SideBar({ toggled, toggleSidebar }: Sidebar) {
  // TODO(sideBar-component): Check if it is possible (with currently used library "react-modern-drawer")
  // to position sidebar bellow navbar instead of overlaping it
  return (
    <Drawer
      open={toggled}
      direction={"right"}
      onClose={toggleSidebar}
      className={classes.sidebar}
      size={300}
    >
      <div className={classes.menu}>
        <div>
          <NavLink to={"#"} className={classes.menuItem}>
            <SwitchIcon className={classes.icon} />
            <div className={classes.text}>Switch project</div>
          </NavLink>
        </div>
        <div>
          <NavLink to={"#"} className={classes.menuItem}>
            <ConnectIcon className={classes.icon} />
            <div className={classes.text}>Connect</div>
          </NavLink>
        </div>
        <div>
          <NavLink to={"#"} className={classes.menuItem}>
            <SettingsIcon className={classes.icon} />
            <div className={classes.text}>Settings</div>
          </NavLink>
        </div>
      </div>
    </Drawer>
  );
}

export default SideBar;
