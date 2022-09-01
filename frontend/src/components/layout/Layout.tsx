import React, { FunctionComponent, useCallback, useState } from "react";
import classes from "./Layout.module.scss";
import Navigation from "../navigation/Navigation";
import Content from "../content/Content";
import SubNavigation from "../subnavigation/SubNavigation";
import Logs from "../../pages/logs/Logs";
import { useLogDrawer } from "../../hooks/use-log-drawer";
import { useNavigation } from "../../hooks/use-navigation";
import { useGetCurrentProject } from "../../hooks/use-api";
// import Button from "components/button/Button";
import SideBar from "components/sidebar/SideBar";

const Layout: FunctionComponent = ({ children }) => {
  const { logDrawerSize } = useLogDrawer();
  const { isSubNavigationVisible } = useNavigation();
  const { data } = useGetCurrentProject();
  const { project: currentProject } = data ?? {};
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen((prevState) => !prevState);
  };
  const getLogDrawerLayoutClass = useCallback(() => {
    return logDrawerSize === "tiny"
      ? ""
      : logDrawerSize === "small"
      ? classes.opened
      : classes.expanded;
  }, [logDrawerSize]);

  return (
    <div className={`${classes.layoutContainer}`}>
      <Navigation
        className={classes.navigation}
        toggleSidebar={toggleSidebar}
      />
      {isSubNavigationVisible && (
        <SubNavigation className={classes.subNavigation} />
      )}
      <SideBar toggled={isOpen} toggleSidebar={toggleSidebar} />
      {/* <Button onClick={toggleSidebar}> TOGGLE SIDEBAR</Button> */}
      <Content className={classes.content}>{children} </Content>
      {!!currentProject?.emulator && (
        <Logs className={`${classes.logs} ${getLogDrawerLayoutClass()}`} />
      )}
    </div>
  );
};

export default Layout;
