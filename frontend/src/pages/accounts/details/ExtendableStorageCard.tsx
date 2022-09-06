import React from "react";
import classes from "./ExtendableStorageCard.module.scss";
import { DecoratedPollingEntity } from "hooks/use-timeout-polling";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { FlowUtils } from "utils/flow-utils";
import classNames from "classnames";

type ExtendableStorageCardProps = {
  content: DecoratedPollingEntity<AccountStorageItem>;
  toggleExtended: (id: string) => void;
  expendedCardIds: Set<string>;
  className?: string;
};

export function ExtendableStorageCard({
  content,
  toggleExtended,
  expendedCardIds,
  className,
}: ExtendableStorageCardProps) {
  const extendClass = classNames(className, {
    [classes.root]: true,
    [classes.gridItemExtended]: expendedCardIds.has(content.pathIdentifier),
  });

  const extendClassToggle = classNames({
    [classes.circleOpen]: !expendedCardIds.has(content.pathIdentifier),
    [classes.circleClosed]: expendedCardIds.has(content.pathIdentifier),
  });

  return (
    <div className={extendClass}>
      <div className={classes.header}>
        <div className={classes.type}>
          {FlowUtils.getLowerCasedPathDomain(content.pathDomain)}
        </div>
        <div
          className={extendClassToggle}
          onClick={() => toggleExtended(content.pathIdentifier)}
        >
          {expendedCardIds.has(content.pathIdentifier) ? (
            <div className={classes.iconClosed}>-</div>
          ) : (
            <div className={classes.iconOpen}>+</div>
          )}
        </div>
      </div>
      <div className={classes.body}>
        <div className={classes.title}>{content.pathIdentifier}</div>
        {expendedCardIds.has(content.pathIdentifier) ? (
          <pre className={classes.json}>
            {JSON.stringify(content.data, undefined, 2)}
          </pre>
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
