import React, { ReactElement, useEffect, useRef } from "react";
import { CadenceValueBuilder } from "../interface";
import { ParamBuilder } from "../ParamBuilder";
import { FclDictionaryEntry, FclValue, FclValues } from "@flowser/shared";
import { MultiMap } from "utils/multi-map";
import toast from "react-hot-toast";

export function DictionaryBuilder(props: CadenceValueBuilder): ReactElement {
  const { type, value, setValue } = props;
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

  const isInitialized = FclValues.isFclDictionaryValue(value);

  useEffect(() => {
    if (!isInitialized) {
      setValue([defaultEntry]);
    }
  }, [isInitialized]);

  // Check for duplicated entries by keys,
  // and remove the last duplicated entry.
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    const valuesByKey = new MultiMap(
      value.map((entry) => [entry.key, entry.value])
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
      toast.error("Duplicated keys found");
    }
  }, [value]);

  if (!isInitialized) {
    return <></>;
  }

  // Returns true if target entry was found by the provided key.
  function updateEntry(
    key: FclValue,
    partialEntry: Partial<FclDictionaryEntry>
  ): boolean {
    if (!isInitialized) {
      throw new Error("Not initialized");
    }
    const entryIndex = value.findIndex(
      (entry: FclDictionaryEntry) => entry.key === key
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

  return (
    <div>
      {value.map((entry: FclDictionaryEntry, index: number) => {
        if (!dictionary.key) {
          throw new Error("Expected dictionary.key field");
        }
        if (!dictionary.value) {
          throw new Error("Expected dictionary.value field");
        }
        return (
          <div key={index}>
            <div>
              Key:{" "}
              <ParamBuilder
                type={dictionary.key}
                value={entry.key}
                setValue={(newKey) => updateEntryKey(entry.key, newKey)}
              />
            </div>
            <div>
              Value:{" "}
              <ParamBuilder
                type={dictionary.value}
                value={entry.value}
                setValue={(newValue) => updateEntryValue(entry.key, newValue)}
              />
            </div>
          </div>
        );
      })}
      <button onClick={() => addEntry()}>+</button>
    </div>
  );
}
