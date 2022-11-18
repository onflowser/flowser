import React, { FC, FunctionComponent, useCallback, useState } from "react";
import classes from "./Layout.module.scss";
import Navigation from "../navigation/Navigation";
import Content from "../content/Content";
import Logs from "../../pages/logs/Logs";
import { useLogDrawer } from "../../hooks/use-log-drawer";
import { SideBar } from "components/sidebar/SideBar";
import { Route, RouteProps, useHistory } from "react-router-dom";
import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import classNames from "classnames";

export const RouteWithBackButton: FC<RouteProps> = (props) => {
  const history = useHistory();
  return (
    <div style={{ height: "100%" }}>
      <div className={classNames(classes.backButtonWrapper)}>
        <IconBackButton
          onClick={() => {
            history.goBack();
          }}
          className={classes.backButton}
        />
      </div>
      <Route {...props} />
    </div>
  );
};

export const RouteWithLayout: FC<RouteProps> = (props) => (
  <Layout>
    <Route {...props} />
  </Layout>
);

const Layout: FunctionComponent = ({ children }) => {
  const { logDrawerSize } = useLogDrawer();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };
  const getLogDrawerLayoutClass = useCallback(() => {
    return logDrawerSize === "tiny"
      ? ""
      : logDrawerSize === "small"
      ? classes.opened
      : classes.expanded;
  }, [logDrawerSize]);

  return (
    <div className={classes.layoutContainer}>
      <Navigation isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <SideBar toggled={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Content className={classes.content}>{children} </Content>
      <Logs className={classNames(classes.logs, getLogDrawerLayoutClass())} />
    </div>
  );
};
