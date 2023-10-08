import React, { ReactElement } from "react";
import classes from "./InternalStorageCard.module.scss";
import { AccountStorageItem } from "@flowser/shared";
import { FlowUtils } from "frontend/src/utils/flow-utils";
import classNames from "classnames";
import { SimpleButton } from "../../common/buttons/SimpleButton/SimpleButton";
import { DecoratedPollingEntity } from "frontend/src/contexts/timeout-polling.context";
import { JsonView } from "../../common/code/JsonView/JsonView";
import { StorageDataTypes } from "../StorageDataTypes/StorageDataTypes";

type ExtendableStorageCardProps = {
  storageItem: DecoratedPollingEntity<AccountStorageItem>;
  onToggleExpand: () => void;
  isExpanded: boolean;
  className?: string;
  enableIntroAnimation?: boolean;
};

export function InternalStorageCard({
  storageItem,
  onToggleExpand,
  isExpanded,
  className,
  enableIntroAnimation = true,
}: ExtendableStorageCardProps): ReactElement {
  const extendClass = classNames(className, {
    [classes.root]: true,
    [classes.gridItemExtended]: isExpanded,
    [classes.introAnimation]:
      enableIntroAnimation && (storageItem.isNew || storageItem.isUpdated),
  });

  const pathIdentifier = storageItem.path.split("/").reverse()[0];

  return (
    <div id={storageItem.id} className={extendClass}>
      <SimpleButton className={classes.header} onClick={() => onToggleExpand()}>
        <div className={classes.type}>
          {FlowUtils.getLowerCasedPathDomain(storageItem.pathDomain)}
        </div>
        <div className={classes.circle}>
          <div className={classes.icon}>{isExpanded ? "-" : "+"}</div>
        </div>
      </SimpleButton>
      <div className={classes.body}>
        <div className={classes.title}>{pathIdentifier}</div>
        {isExpanded ? (
          <JsonView
            name="data"
            className={classes.jsonViewer}
            data={storageItem.data as Record<string, unknown>}
          />
        ) : (
          <StorageDataTypes storageItem={storageItem} />
        )}
      </div>
    </div>
  );
}
