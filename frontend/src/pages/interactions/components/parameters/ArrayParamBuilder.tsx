import React, { ReactElement, useEffect, useMemo } from "react";
import { ParameterBuilder } from "./parameter-builder";
import { ParamBuilder } from "./ParamBuilder";

export function ArrayParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterType, parameterValue, setParameterValue } = props;

  const { array } = parameterType;
  if (array === undefined) {
    throw new Error("Expected array field");
  }

  const isValueArray = parameterValue instanceof Array;
  const isConstantArray = array.size !== -1;
  const isInitialized = useMemo(() => {
    if (!isValueArray) {
      return false;
    }
    const isUninitializedConstantArray =
      isConstantArray && parameterValue.length !== array.size;
    return !isUninitializedConstantArray;
  }, [parameterValue, isValueArray]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    if (isConstantArray) {
      setParameterValue(makeEmptyArrayOfSize(array.size));
    } else {
      setParameterValue([]);
    }
  }, [isConstantArray, isInitialized]);

  function setValueByIndex(value: unknown, index: number) {
    if (parameterValue instanceof Array) {
      parameterValue[index] = value;
      setParameterValue(parameterValue);
    }
  }

  function increaseSize() {
    if (parameterValue instanceof Array) {
      setParameterValue([...parameterValue, undefined]);
    }
  }

  function decreaseSize() {
    if (parameterValue instanceof Array) {
      setParameterValue(parameterValue.slice(0, parameterValue.length - 1));
    }
  }

  if (!isInitialized) {
    return <></>;
  }

  return (
    <div>
      {isValueArray &&
        parameterValue.map((value, index) => {
          if (array.element === undefined) {
            throw new Error("Expected array element field");
          }
          return (
            <ParamBuilder
              key={index}
              parameterType={array.element}
              parameterValue={value}
              setParameterValue={(value) => setValueByIndex(value, index)}
            />
          );
        })}
      {!isConstantArray && (
        <div>
          <button onClick={() => decreaseSize()}>-</button>
          <button onClick={() => increaseSize()}>+</button>
        </div>
      )}
    </div>
  );
}

function makeEmptyArrayOfSize(size: number) {
  return Array.from({ length: size });
}
