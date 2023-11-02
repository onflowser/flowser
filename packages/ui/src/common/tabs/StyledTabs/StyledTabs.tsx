import classes from "./StyledTabs.module.scss";
import { BaseTabs, BaseTabsProps } from "../BaseTabs/BaseTabs";
import React, { ReactElement } from "react";
import classNames from "classnames";

export type StyledTabsProps = BaseTabsProps;

export function StyledTabs(props: StyledTabsProps): ReactElement {
  return (
    <BaseTabs
      {...props}
      tabWrapperClassName={classNames(
        classes.tabWrapper,
        props.tabWrapperClassName,
      )}
      inactiveTabClassName={classNames(
        classes.inactiveTab,
        props.inactiveTabClassName,
      )}
      tabLabelClassName={classNames(classes.tabLabel, props.tabLabelClassName)}
      tabClassName={classNames(classes.tab, props.tabClassName)}
      activeTabClassName={classNames(
        classes.activeTab,
        props.activeTabClassName,
      )}
      contentClassName={classNames(classes.content, props.contentClassName)}
    />
  );
}
