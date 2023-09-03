import React, { FC, FunctionComponent, ReactNode } from "react";
import classes from "./Layout.module.scss";
import { Logs } from "../../modules/logs/Logs";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as IconBackButton } from "../../assets/icons/back-button.svg";
import classNames from "classnames";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { SideNavigation } from "../side-navigation/SideNavigation";

export const BackButtonLayout: FC<{ children: ReactNode }> = (props) => {
  const navigate = useNavigate();
  return (
    <div style={{ height: "100%" }}>
      <div className={classNames(classes.backButtonWrapper)}>
        <IconBackButton
          onClick={() => navigate(-1)}
          className={classes.backButton}
        />
      </div>
      {props.children}
    </div>
  );
};

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
