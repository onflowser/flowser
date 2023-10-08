import { AccountStorageItem } from "@flowser/shared";
import React, { ReactElement } from "react";
import classes from "./StorageDataTypes.module.scss";
import { BaseBadge } from "../../common/misc/BaseBadge/BaseBadge";

type StorageDataTypesProps = {
  storageItem: AccountStorageItem;
};

export function StorageDataTypes(props: StorageDataTypesProps): ReactElement {
  const storedDataTypes = getStoredDataTypes(props.storageItem.data);

  return (
    <div className={classes.root}>
      {storedDataTypes.map((path) => (
        <BaseBadge key={path} className={classes.badge}>
          {path}
        </BaseBadge>
      ))}
    </div>
  );
}

function getStoredDataTypes(
  storageData: Record<string, unknown> | undefined
): string[] {
  const nestedObjectsKeys = Object.keys(storageData ?? {});
  const uniqueDataTypes = new Set<string>();
  const addAll = (values: string[]) =>
    values.forEach((value) => uniqueDataTypes.add(value));

  addAll(getDataTypeKeysAtCurrentDepth(storageData ?? {}));

  // Find all data type keys that are stored in nested objects
  for (const key of nestedObjectsKeys) {
    const nestedObjectCandidate = storageData?.[key] as
      | Record<string, unknown>
      | undefined;
    const isValidCandidate =
      typeof nestedObjectCandidate === "object" &&
      nestedObjectCandidate !== null;
    if (isValidCandidate) {
      const nestedDataTypeKeys = getStoredDataTypes(nestedObjectCandidate);
      addAll(nestedDataTypeKeys);
    }
  }
  return [...uniqueDataTypes];
}

function getDataTypeKeysAtCurrentDepth(
  storageData: Record<string, unknown>
): string[] {
  if ("kind" in storageData) {
    return [storageData.kind as string];
  }
  return [];
}
