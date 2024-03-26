import React, { ReactNode } from "react";
import classes from "./ProjectLayout.module.scss";
import { Logs } from "../../../logs/Logs";
import classNames from "classnames";
import { Breadcrumbs } from "../../misc/Breadcrumbs/Breadcrumbs";
import { SideNavigation } from "../../misc/SideNavigation/SideNavigation";
import { useLocation } from "../../../contexts/navigation.context";

type ProjectLayoutProps = {
  children: ReactNode;
};

export const scrollableElementId = "flowser-scroll";

export function WorkspaceLayout(props: ProjectLayoutProps) {
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
          {props.children}
        </div>
        <Logs className={classes.logs} />
      </div>
    </div>
  );
}
