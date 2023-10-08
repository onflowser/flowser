import React, { ReactElement } from "react";
import classes from "./InternalStorageCard.module.scss";
import classNames from "classnames";
import { SimpleButton } from "../../common/buttons/SimpleButton/SimpleButton";
import { JsonView } from "../../common/code/JsonView/JsonView";
import { StorageDataTypes } from "../StorageDataTypes/StorageDataTypes";
import { FlowUtils } from "../../utils/flow-utils";
import { FlowAccountStorage } from '@onflowser/api';

type ExtendableStorageCardProps = {
  storageItem: FlowAccountStorage;
  onToggleExpand: () => void;
  isExpanded: boolean;
  className?: string;
};

export function InternalStorageCard({
  storageItem,
  onToggleExpand,
  isExpanded,
  className,
}: ExtendableStorageCardProps): ReactElement {
  const extendClass = classNames(className, {
    [classes.root]: true,
    [classes.gridItemExtended]: isExpanded,
    [classes.introAnimation]: false
  });

  const pathIdentifier = storageItem.path.split("/").reverse()[0];

  return (
    <div id={storageItem.id} className={extendClass}>
      <SimpleButton className={classes.header} onClick={() => onToggleExpand()}>
        <div className={classes.type}>
          {FlowUtils.getLowerCasedPathDomain(storageItem.domain)}
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
