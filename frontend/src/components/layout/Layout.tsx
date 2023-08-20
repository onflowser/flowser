import React, { FC, FunctionComponent } from "react";
import classes from "./Layout.module.scss";
import Logs from "../../pages/logs/Logs";
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

export const RouteWithProjectLayout: FC<RouteProps> = (props) => (
  <ProjectLayout>
    <Route {...props} />
  </ProjectLayout>
);

const ProjectLayout: FunctionComponent = ({ children }) => {
  const location = useLocation();
  const showMargin = !location.pathname.startsWith(routes.interactions);

  return (
    <div className={classes.root}>
      <SideNavigation className={classes.sideNavigation} />
      <div className={classes.mainContent}>
        <div
          className={classNames(classes.body, {
            [classes.bodyWithMargin]: showMargin,
          })}
        >
          <Breadcrumbs />
          {children}
        </div>
        <Logs />
      </div>
    </div>
  );
};
