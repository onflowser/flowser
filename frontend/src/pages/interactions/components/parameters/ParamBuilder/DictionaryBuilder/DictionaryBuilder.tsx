import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import { ParamBuilder } from "../ParamBuilder";
import { FclDictionaryEntry, FclValue, FclValues } from "@flowser/shared";

export function DictionaryBuilder(props: CadenceValueBuilder): ReactElement {
  const { type, value, setValue } = props;
  const { dictionary } = type;

  if (!dictionary) {
    throw new Error("Expected dictionary field");
  }

  const isInitialized = FclValues.isFclDictionaryValue(value);

  useEffect(() => {
    if (!isInitialized) {
      setValue([
        {
          key: undefined,
          value: undefined,
        },
      ]);
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <></>;
  }

  function updateEntry(
    key: FclValue,
    partialEntry: Partial<FclDictionaryEntry>
  ) {
    if (isInitialized) {
      const entryIndex = value.findIndex(
        (entry: FclDictionaryEntry) => entry.key === key
      );
      value[entryIndex] = { ...value[entryIndex], ...partialEntry };
      setValue(value);
    }
  }

  function addEntry() {
    if (isInitialized) {
      setValue([
        ...value,
        {
          key: undefined,
          value: undefined,
        },
      ]);
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
                setValue={(newKey) => updateEntry(entry.key, { key: newKey })}
              />
            </div>
            <div>
              Value:{" "}
              <ParamBuilder
                type={dictionary.value}
                value={entry.value}
                setValue={(newValue) =>
                  updateEntry(entry.key, { value: newValue })
                }
              />
            </div>
          </div>
        );
      })}
      <button onClick={() => addEntry()}>+</button>
    </div>
  );
}
