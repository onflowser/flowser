import classes from "./StyledTabs.module.scss";
import { Tabs, TabsProps } from "./Tabs";
import React, { ReactElement } from "react";

export type StyledTabsProps = TabsProps;

export function StyledTabs(props: StyledTabsProps): ReactElement {
  return (
    <Tabs
      tabWrapperClassName={classes.tabWrapper}
      inactiveTabClassName={classes.inactiveTab}
      tabLabelClassName={classes.tabLabel}
      tabClassName={classes.tab}
      activeTabClassName={classes.activeTab}
      contentClassName={classes.content}
      {...props}
    />
  );
}
