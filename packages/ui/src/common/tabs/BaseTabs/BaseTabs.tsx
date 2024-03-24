import classNames from "classnames";
import React, { ReactElement, ReactNode, useState } from "react";
import classes from "./BaseTabs.module.scss";
import { FlowserIcon } from "../../icons/FlowserIcon";

export type BaseTabItem<IdType = string> = {
  id: IdType;
  label: React.ReactNode | string;
  content: React.ReactNode;
};

export type BaseTabsProps<IdType = string> = {
  label?: string;
  className?: string;
  tabClassName?: string;
  tabWrapperClassName?: string;
  tabLabelClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  contentClassName?: string;
  currentTabId?: string | undefined;
  onChangeTab?: (tab: BaseTabItem<IdType>) => void;
  onClose?: (tab: BaseTabItem<IdType>) => void;
  onAddNew?: () => void;
  defaultContent?: ReactNode;
  // Will appear after all tab buttons.
  contentAfterTabs?: ReactNode;
  tabs: BaseTabItem<IdType>[];
};

export function BaseTabs<IdType>(props: BaseTabsProps<IdType>): ReactElement {
  const {
    label,
    className,
    tabWrapperClassName,
    tabLabelClassName,
    tabs,
    onClose,
    onAddNew,
    defaultContent
  } = props;

  const [fallbackCurrentTabId, setFallbackCurrentTabId] = useState(tabs[0]?.id);
  const currentTabId = props.currentTabId ?? fallbackCurrentTabId;

  function onChangeTab(tab: BaseTabItem<IdType>) {
    if (props.onChangeTab) {
      props.onChangeTab(tab);
    } else {
      setFallbackCurrentTabId(tab.id);
    }
  }

  const currentTab = tabs.find((tab) => tab.id === currentTabId);
  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.tabAndEndContentWrapper}>
        <div className={classNames(classes.tabWrapper, tabWrapperClassName)}>
          {label && <span className={classes.label}>{label}:</span>}
          {tabs.map((tab) => {
            const isActive = currentTabId === tab.id;
            return (
              <button
                key={String(tab.id)}
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
                    onClick={(e: MouseEvent) => {
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
        {props.contentAfterTabs}
      </div>
      <div
        className={classNames(props.contentClassName, classes.content)}
        style={{ flex: 1 }}
      >
        {currentTab?.content ?? defaultContent}
      </div>
    </div>
  );
}
