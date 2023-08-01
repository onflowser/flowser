import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./TabList.module.scss";
import { FlowserIcon } from "../icons/Icons";

export type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabListProps = {
  className?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  currentTabId: string | undefined;
  onChangeTab: (tab: TabItem) => void;
  onClose?: (tab: TabItem) => void;
  tabs: TabItem[];
};

export function TabList(props: TabListProps): ReactElement {
  const { className, tabs, currentTabId, onChangeTab, onClose } = props;
  const currentTab = tabs.find((tab) => tab.id === currentTabId);
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.navigation}>
        {tabs.map((tab) => {
          const isActive = currentTabId === tab.id;
          return (
            <button
              key={tab.id}
              className={classNames(classes.tabButton, {
                [props.activeTabClassName ?? classes.tabButtonActive]: isActive,
                [props.inactiveTabClassName ?? classes.tabButtonInactive]:
                  !isActive,
              })}
              onClick={() => onChangeTab(tab)}
            >
              {tab.label}
              {onClose && (
                <FlowserIcon.Close
                  className={classes.closeButton}
                  onClick={() => onClose(tab)}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className={classes.body}>{currentTab?.content}</div>
    </div>
  );
}
