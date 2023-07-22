import React, { ReactElement, useEffect } from "react";
import { ParameterBuilder } from "../interface";
import { ParamBuilder } from "../ParamBuilder";

export function DictionaryBuilder(props: ParameterBuilder): ReactElement {
  const { parameterType, parameterValue, setParameterValue } = props;
  const { dictionary } = parameterType;

  if (!dictionary) {
    throw new Error("Expected dictionary field");
  }

  const isInitialized = parameterValue instanceof Object;

  useEffect(() => {
    setParameterValue({});
  }, [isInitialized]);

  if (!isInitialized) {
    return <></>;
  }

  const entries = Object.entries(parameterValue);

  function setValue(key: unknown, value: unknown) {
    if (isInitialized) {
      setParameterValue({
        ...parameterValue,
        ...{ [key as never]: value },
      });
    }
  }

  function renameKey(oldKey: unknown, newKey: unknown) {
    if (isInitialized) {
      const value = parameterValue[oldKey as never];
      delete parameterValue[oldKey as never];
      parameterValue[newKey as never] = value;
      setParameterValue(parameterValue);
    }
  }

  function addEntry() {
    // Undefined can't be used as a key.
    // It's converted to a string automatically.
    setValue("", undefined);
  }

  return (
    <div>
      {entries.map((entry, index) => {
        if (!dictionary.key) {
          throw new Error("Expected dictionary.key field");
        }
        if (!dictionary.value) {
          throw new Error("Expected dictionary.value field");
        }
        const [key, value] = entry;
        return (
          <div key={index}>
            <div>
              Key:{" "}
              <ParamBuilder
                parameterType={dictionary.key}
                parameterValue={key}
                setParameterValue={(newKey) => renameKey(key, newKey)}
              />
            </div>
            <div>
              Value:{" "}
              <ParamBuilder
                parameterType={dictionary.value}
                parameterValue={value}
                setParameterValue={(value) => setValue(key, value)}
              />
            </div>
          </div>
        );
      })}
      <button onClick={() => addEntry()}>+</button>
    </div>
  );
}
