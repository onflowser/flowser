import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./TabList.module.scss";
import { FlowserIcon } from "../icons/Icons";

export type TabItem = {
  id: string;
  label: React.ReactNode | string;
  content: React.ReactNode;
};

type TabListProps = {
  label?: string;
  className?: string;
  tabClassName?: string;
  tabWrapperClassName?: string;
  tabLabelClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  currentTabId: string | undefined;
  onChangeTab: (tab: TabItem) => void;
  onClose?: (tab: TabItem) => void;
  onAddNew?: () => void;
  tabs: TabItem[];
};

export function TabList(props: TabListProps): ReactElement {
  const {
    label,
    className,
    tabWrapperClassName,
    tabLabelClassName,
    tabs,
    currentTabId,
    onChangeTab,
    onClose,
    onAddNew,
  } = props;
  const currentTab = tabs.find((tab) => tab.id === currentTabId);
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classNames(classes.tabWrapper, tabWrapperClassName)}>
        {label && <span className={classes.label}>{label}:</span>}
        {tabs.map((tab) => {
          const isActive = currentTabId === tab.id;
          return (
            <button
              key={tab.id}
              className={classNames(classes.tabButton, props.tabClassName, {
                [props.activeTabClassName ?? classes.tabButtonActive]: isActive,
                [props.inactiveTabClassName ?? classes.tabButtonInactive]:
                  !isActive,
              })}
              onClick={() => onChangeTab(tab)}
            >
              <span className={classNames(classes.label, tabLabelClassName)}>
                {tab.label}
              </span>
              {onClose && (
                <FlowserIcon.Close
                  className={classes.closeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(tab);
                  }}
                />
              )}
            </button>
          );
        })}
        {onAddNew && (
          <button className={classes.newTabButton} onClick={() => onAddNew()}>
            <FlowserIcon.Plus />
          </button>
        )}
      </div>
      {currentTab?.content}
    </div>
  );
}
