import React, { FunctionComponent, useCallback } from "react";
import classes from "./Layout.module.scss";
import Navigation from "../navigation/Navigation";
import Content from "../content/Content";
import SubNavigation from "../subnavigation/SubNavigation";
import Logs from "../../pages/logs/Logs";
import { useLogDrawer } from "../../hooks/use-log-drawer";
import { useNavigation } from "../../hooks/use-navigation";
import { useGetCurrentProject } from "../../hooks/use-api";

const Layout: FunctionComponent = ({ children }) => {
  const { logDrawerSize } = useLogDrawer();
  const { isSubNavigationVisible } = useNavigation();
  const { data } = useGetCurrentProject();
  const { project: currentProject } = data ?? {};
  const getLogDrawerLayoutClass = useCallback(() => {
    return logDrawerSize === "tiny"
      ? ""
      : logDrawerSize === "small"
      ? classes.opened
      : classes.expanded;
  }, [logDrawerSize]);

  return (
    <div className={`${classes.layoutContainer}`}>
      <Navigation className={classes.navigation} />
      {isSubNavigationVisible && (
        <SubNavigation className={classes.subNavigation} />
      )}
      <Content className={classes.content}>{children} </Content>
      {!!currentProject?.emulator && (
        <Logs className={`${classes.logs} ${getLogDrawerLayoutClass()}`} />
      )}
    </div>
  );
};

export default Layout;
