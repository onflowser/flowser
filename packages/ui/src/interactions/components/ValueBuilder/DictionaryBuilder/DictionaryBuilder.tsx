import React, { ReactElement, useEffect, useRef } from "react";
import { CadenceValueBuilder } from "../interface";
import { ValueBuilder } from "../ValueBuilder";
import toast from "react-hot-toast";
import classes from "./DictionaryBuilder.module.scss";
import { SimpleButton } from "../../../../common/buttons/SimpleButton/SimpleButton";
import { SizedBox } from "../../../../common/misc/SizedBox/SizedBox";
import { MultiMap } from "../../../../utils/multi-map";
import { FclDictionaryEntry, FclValue, FclValueUtils } from "@onflowser/core";

export function DictionaryBuilder(props: CadenceValueBuilder): ReactElement {
  const { disabled, type, value, setValue } = props;
  const { dictionary } = type;

  const defaultEntry: FclDictionaryEntry = {
    key: undefined,
    value: undefined,
  };
  // A lookup from old keys to new keys
  const keyRenamingLookup = useRef(new Map<FclValue, FclValue>());

  if (!dictionary) {
    throw new Error("Expected dictionary field");
  }

  const isInitialized = FclValueUtils.isFclDictionaryValue(value);

  // TODO(polish): Don't trigger this hook on every rerender
  //  See: https://www.notion.so/flowser/Sometimes-arguments-don-t-get-initialized-properly-80c34018155646d08e4da0bc6c977ed9?pvs=4
  useEffect(() => {
    if (!isInitialized) {
      setValue([defaultEntry]);
    }
  });

  // Check for duplicated entries by keys,
  // and remove the last duplicated entry.
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    const valuesByKey = new MultiMap(
      value.map((entry) => [entry.key, entry.value]),
    );
    const duplicatedEntry = Array.from(valuesByKey.entries())
      .filter((entry) => entry[1].length > 1)
      .map((entry) => entry)[0];
    if (duplicatedEntry) {
      const lastDuplicatedEntryIndex = value
        .reverse()
        .findIndex((entry) => entry.key == duplicatedEntry[0]);
      const deduplicatedEntries = [...value];
      deduplicatedEntries.splice(lastDuplicatedEntryIndex, 1);
      setValue(deduplicatedEntries);
      toast.error(
        <div>
          <b>Duplicated keys found</b>
          <br />
          <span>Make sure that all keys are unique and specified.</span>
        </div>,
      );
    }
  }, [value]);

  if (!isInitialized) {
    return <></>;
  }

  // Returns true if target entry was found by the provided key.
  function updateEntry(
    key: FclValue,
    partialEntry: Partial<FclDictionaryEntry>,
  ): boolean {
    if (!isInitialized) {
      throw new Error("Not initialized");
    }
    const entryIndex = value.findIndex(
      (entry: FclDictionaryEntry) => entry.key === key,
    );
    const isEntryFound = entryIndex !== -1;
    if (isEntryFound) {
      value[entryIndex] = { ...value[entryIndex], ...partialEntry };
      setValue([...value]);
    }
    return isEntryFound;
  }

  function updateEntryKey(oldKey: FclValue, newKey: FclValue) {
    updateEntry(oldKey, { key: newKey });
    keyRenamingLookup.current.set(oldKey, newKey);
  }

  function updateEntryValue(key: FclValue, value: FclValue) {
    const isKeyFound = updateEntry(key, { value });
    if (!isKeyFound) {
      // The following scenario happens during initialization phase:
      // 1. entry key is updated
      // 2. entry value is updated using the old key immediately after
      // This makes the second update unsuccessful, as the outdated key is used.
      // To solve this, without needing to change the child components,
      // we store a lookup of the key renaming and use the new key when update fails.
      const newKey = keyRenamingLookup.current.get(key);
      const isNewKeyFound = updateEntry(newKey, { value });
      if (!isNewKeyFound) {
        throw new Error("Expecting to found entry with new key");
      }
    }
  }

  function addEntry() {
    if (isInitialized) {
      setValue([...value, defaultEntry]);
    }
  }

  function removeLastEntry() {
    if (isInitialized) {
      setValue(value.slice(0, value.length - 1));
    }
  }

  return (
    <div className={classes.root}>
      {value.map((entry: FclDictionaryEntry, index: number) => {
        if (!dictionary.key) {
          throw new Error("Expected dictionary.key field");
        }
        if (!dictionary.value) {
          throw new Error("Expected dictionary.value field");
        }
        return (
          <div key={index} className={classes.dictionaryEntry}>
            <div className={classes.keyOrValue}>
              <pre>Key:{"   "}</pre>
              <ValueBuilder
                type={dictionary.key}
                disabled={disabled}
                value={entry.key}
                setValue={(newKey) => updateEntryKey(entry.key, newKey)}
              />
            </div>
            <div className={classes.keyOrValue}>
              <pre>Value: </pre>
              <ValueBuilder
                type={dictionary.value}
                disabled={disabled}
                value={entry.value}
                setValue={(newValue) => updateEntryValue(entry.key, newValue)}
              />
            </div>
          </div>
        );
      })}
      {!disabled && (
        <div>
          <SimpleButton onClick={() => addEntry()}>Add</SimpleButton>
          <SizedBox inline width={10} />
          <SimpleButton onClick={() => removeLastEntry()}>Remove</SimpleButton>
        </div>
      )}
    </div>
  );
}
