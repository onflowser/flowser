import React, { FC, FunctionComponent, useState } from "react";
import classes from "./Layout.module.scss";
import { TopRow } from "../top-row/TopRow";
import Logs from "../../pages/logs/Logs";
import { SideBar } from "components/sidebar/SideBar";
import { Route, RouteProps, useHistory, useLocation } from "react-router-dom";
import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import classNames from "classnames";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { SideNavigation } from "../side-navigation/SideNavigation";
import { routes } from "../../constants/routes";

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
  const location = useLocation();
  const showMargin = !location.pathname.startsWith(routes.interactions);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <div className={classes.root}>
      <SideNavigation className={classes.sideNavigation} />
      <div className={classes.mainContent}>
        <TopRow isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <Breadcrumbs />
        <SideBar toggled={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={classNames(classes.body, {
            [classes.bodyWithMargin]: showMargin,
          })}
        >
          {children}
        </div>
        <Logs />
      </div>
    </div>
  );
};
