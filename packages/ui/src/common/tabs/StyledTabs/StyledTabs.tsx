import classes from "./StyledTabs.module.scss";
import { BaseTabs, BaseTabsProps } from "../BaseTabs/BaseTabs";
import React, { ReactElement } from "react";

export type StyledTabsProps = BaseTabsProps;

export function StyledTabs(props: StyledTabsProps): ReactElement {
  return (
    <BaseTabs
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
