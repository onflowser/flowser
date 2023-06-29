import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./SideMenu.module.scss";

export type SideMenuTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type SideMenuProps = {
  className?: string;
  currentTab: SideMenuTab;
  onChangeTab: (tab: SideMenuTab) => void;
  tabs: SideMenuTab[];
};

export function SideMenu(props: SideMenuProps): ReactElement {
  const { className, tabs, currentTab, onChangeTab } = props;
  return (
    <div className={classNames(classes.sideMenu, className)}>
      <div className={classes.navigation}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={classNames(classes.tabButton, {
              [classes.tabButtonSelected]: currentTab.id === tab.id,
            })}
            onClick={() => onChangeTab(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={classes.body}>{currentTab.content}</div>
    </div>
  );
}
