import classNames from "classnames";
import React, { ReactElement, useState } from "react";
import classes from "./Tabs.module.scss";
import { FlowserIcon } from "../icons/Icons";

export type TabItem = {
  id: string;
  label: React.ReactNode | string;
  content: React.ReactNode;
};

export type TabsProps = {
  label?: string;
  className?: string;
  tabClassName?: string;
  tabWrapperClassName?: string;
  tabLabelClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  contentClassName?: string;
  currentTabId?: string | undefined;
  onChangeTab?: (tab: TabItem) => void;
  onClose?: (tab: TabItem) => void;
  onAddNew?: () => void;
  tabs: TabItem[];
};

export function Tabs(props: TabsProps): ReactElement {
  const {
    label,
    className,
    tabWrapperClassName,
    tabLabelClassName,
    tabs,
    onClose,
    onAddNew,
  } = props;

  const [fallbackCurrentTabId, setFallbackCurrentTabId] = useState(
    props.tabs[0]?.id
  );
  const currentTabId = props.currentTabId ?? fallbackCurrentTabId;

  function onChangeTab(tab: TabItem) {
    if (props.onChangeTab) {
      props.onChangeTab(tab);
    } else {
      setFallbackCurrentTabId(tab.id);
    }
  }

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
      <div
        className={classNames(props.contentClassName, classes.content)}
        style={{ flex: 1 }}
      >
        {currentTab?.content}
      </div>
    </div>
  );
}
