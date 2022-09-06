import React, { ReactElement } from "react";
import classes from "./BaseStorageCard.module.scss";
import { DecoratedPollingEntity } from "hooks/use-timeout-polling";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { FlowUtils } from "utils/flow-utils";
import classNames from "classnames";
import ReactJson from "react-json-view";

type ExtendableStorageCardProps = {
  content: DecoratedPollingEntity<AccountStorageItem>;
  onToggleExpand: () => void;
  isExpanded: boolean;
  className?: string;
};

export function BaseStorageCard({
  content,
  onToggleExpand,
  isExpanded,
  className,
}: ExtendableStorageCardProps): ReactElement {
  const extendClass = classNames(className, {
    [classes.root]: true,
    [classes.gridItemExtended]: isExpanded,
  });

  const extendClassToggle = classNames({
    [classes.circleOpen]: !isExpanded,
    [classes.circleClosed]: isExpanded,
  });

  return (
    <div className={extendClass}>
      <div className={classes.header}>
        <div className={classes.type}>
          {FlowUtils.getLowerCasedPathDomain(content.pathDomain)}
        </div>
        <div className={extendClassToggle} onClick={() => onToggleExpand()}>
          {isExpanded ? (
            <div className={classes.iconClosed}>-</div>
          ) : (
            <div className={classes.iconOpen}>+</div>
          )}
        </div>
      </div>
      <div className={classes.body}>
        <div className={classes.title}>{content.pathIdentifier}</div>
        {isExpanded ? (
          <div className={classes.json}>
            <ReactJson
              style={{ backgroundColor: "none" }}
              theme="ashes"
              src={content.data as Record<string, unknown>}
            />
          </div>
        ) : (
          <div className={classes.tags}>
            <div className={classes.badge}>ResourceType</div>
            <div className={classes.badge}>flowContractAuditVouchersAdmin</div>
          </div>
        )}
      </div>
    </div>
  );
}
