import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./TabList.module.scss";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabListProps = {
  className?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  currentTab: TabItem;
  onChangeTab: (tab: TabItem) => void;
  tabs: TabItem[];
};

export function TabList(props: TabListProps): ReactElement {
  const { className, tabs, currentTab, onChangeTab } = props;
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.navigation}>
        {tabs.map((tab) => {
          const isActive = currentTab.id === tab.id;
          return (
            <button
              key={tab.id}
              className={classNames(classes.tabButton, {
                [props.activeTabClassName ?? ""]: isActive,
                [props.inactiveTabClassName ?? ""]: !isActive,
              })}
              onClick={() => onChangeTab(tab)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className={classes.body}>{currentTab.content}</div>
    </div>
  );
}