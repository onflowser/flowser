import React, { FunctionComponent } from "react";
import classes from "./ProjectLayout.module.scss";
import { Logs } from "../../../modules/logs/Logs";
import { useLocation } from "react-router-dom";
import classNames from "classnames";
import { Breadcrumbs } from "../../breadcrumbs/Breadcrumbs";
import { SideNavigation } from "../../side-navigation/SideNavigation";

export const scrollableElementId = "flowser-scroll";

export const ProjectLayout: FunctionComponent = ({ children }) => {
  const location = useLocation();
  const showMargin = !location.pathname.endsWith("interactions");

  return (
    <div className={classes.root}>
      <SideNavigation className={classes.sideNavigation} />
      <div className={classes.mainContent}>
        <Breadcrumbs className={classes.breadcrumbs} />
        <div
          id={scrollableElementId}
          className={classNames(classes.body, {
            [classes.bodyWithBorderSpacing]: showMargin,
          })}
        >
          {children}
        </div>
        <Logs className={classes.logs} />
      </div>
    </div>
  );
};
