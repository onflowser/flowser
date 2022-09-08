import React, { FunctionComponent, useCallback, useState } from "react";
import classes from "./Layout.module.scss";
import Navigation from "../navigation/Navigation";
import Content from "../content/Content";
import Logs from "../../pages/logs/Logs";
import { useLogDrawer } from "../../hooks/use-log-drawer";
import { useGetCurrentProject } from "../../hooks/use-api";
import { SideBar } from "components/sidebar/SideBar";
import { Route, RouteProps } from "react-router-dom";

export const RouteWithLayout = (props: RouteProps) => (
  <Layout>
    <Route {...props} />
  </Layout>
);

const Layout: FunctionComponent = ({ children }) => {
  const { logDrawerSize } = useLogDrawer();
  const { data } = useGetCurrentProject();
  const { project: currentProject } = data ?? {};
  const [isSidebarOpe, setIsSidebarOpe] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpe((prevState) => !prevState);
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
        isSidebarOpen={isSidebarOpe}
        toggleSidebar={toggleSidebar}
      />
      <SideBar toggled={isSidebarOpe} toggleSidebar={toggleSidebar} />
      <Content className={classes.content}>{children} </Content>
      {!!currentProject?.emulator && (
        <Logs className={`${classes.logs} ${getLogDrawerLayoutClass()}`} />
      )}
    </div>
  );
};

export default Layout;
