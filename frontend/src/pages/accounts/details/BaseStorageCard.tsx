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

  const storageDataPaths = getDataTypeKeysInStorageData(content.data);

  return (
    <div id={content.id} className={extendClass}>
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
              collapsed={4}
              src={content.data as Record<string, unknown>}
            />
          </div>
        ) : (
          <div className={classes.tags}>
            {storageDataPaths.map((path) => (
              <div key={path} className={classes.badge}>
                {path}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getDataTypeKeysInStorageData(
  storageData: Record<string, unknown> | undefined
): string[] {
  const nestedObjectsKeys = Object.keys(storageData ?? {});
  const uniqueDataTypes = new Set<string>();
  const addAll = (values: string[]) =>
    values.forEach((value) => uniqueDataTypes.add(value));

  addAll(getDataTypeKeysAtCurrentDepth(storageData));

  // Find all data type keys that are stored in nested objects
  for (const key of nestedObjectsKeys) {
    const nestedObjectCandidate = storageData?.[key] as
      | Record<string, unknown>
      | undefined;
    const isValidCandidate =
      typeof nestedObjectCandidate === "object" &&
      nestedObjectCandidate !== null;
    if (isValidCandidate) {
      const nestedDataTypeKeys = getDataTypeKeysInStorageData(
        nestedObjectCandidate
      );
      addAll(nestedDataTypeKeys);
    }
  }
  return [...uniqueDataTypes];
}

function getDataTypeKeysAtCurrentDepth(
  storageData: Record<string, unknown> | undefined
): string[] {
  const compositeDataTypeKeyPattern = /[a-zA-Z]+Type/;
  const keys = Object.keys(storageData ?? {});
  const compositeDataTypes = keys.filter((key) =>
    compositeDataTypeKeyPattern.test(key)
  );
  const simpleDataTypes =
    storageData !== undefined && "value" in storageData
      ? [typeof storageData.value]
      : [];
  return [...compositeDataTypes, ...simpleDataTypes];
}
