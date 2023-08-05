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
  label?: string;
  className?: string;
  tabClassName?: string;
  tabWrapperClassName?: string;
  tabLabelClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  currentTabId: string | undefined;
  onChangeTab: (tab: TabItem) => void;
  onChangeLabel?: (tab: TabItem) => void;
  onClose?: (tab: TabItem) => void;
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
    onChangeLabel,
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
              <input
                style={{
                  cursor: onChangeLabel === undefined ? "pointer" : "text",
                }}
                className={classNames(classes.labelInput, tabLabelClassName)}
                disabled={onChangeLabel === undefined}
                value={tab.label}
                onChange={(e) => {
                  if (onChangeLabel) {
                    onChangeLabel({ ...tab, label: e.target.value });
                  }
                }}
              />
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
      </div>
      <div className={classes.body}>{currentTab?.content}</div>
    </div>
  );
}
