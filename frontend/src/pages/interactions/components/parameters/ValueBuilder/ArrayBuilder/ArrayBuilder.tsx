import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import { ValueBuilder } from "../ValueBuilder";
import classes from "./ArrayBuilder.module.scss";
import { FclArrayValue, FclValue, FclValues } from "@flowser/shared";
import { SimpleButton } from "../../../../../../components/buttons/simple-button/SimpleButton";
import { SizedBox } from "../../../../../../components/sized-box/SizedBox";

export function ArrayBuilder(props: CadenceValueBuilder): ReactElement {
  const { type, value, setValue } = props;

  const { array } = type;
  if (array === undefined) {
    throw new Error("Expected array field");
  }

  const isConstantArray = array.size !== -1;
  const isFclArray = FclValues.isFclArrayValue(value);
  const isUninitializedConstantArray =
    isConstantArray && isFclArray && value.length !== array.size;
  const isInitialized = isFclArray && !isUninitializedConstantArray;

  useEffect(() => {
    if (!isInitialized) {
      setValue(initFclArrayOfSize(isConstantArray ? array.size : 0));
    }
  }, [isConstantArray, isInitialized]);

  function setElement(index: number, element: FclValue) {
    if (isInitialized) {
      value[index] = element;
      setValue(value);
    }
  }

  function increaseSize() {
    if (isInitialized) {
      setValue([...value, undefined]);
    }
  }

  function decreaseSize() {
    if (isInitialized) {
      setValue(value.slice(0, value.length - 1));
    }
  }

  if (!isFclArray) {
    return <></>;
  }

  return (
    <div className={classes.root}>
      {value.map((value, index) => {
        if (array.element === undefined) {
          throw new Error("Expected array element field");
        }
        return (
          <div key={index} className={classes.arrayElement}>
            <code className={classes.indexDisplay}>{index}:</code>
            <ValueBuilder
              type={array.element}
              value={value}
              setValue={(value) => setElement(index, value)}
            />
          </div>
        );
      })}
      {!isConstantArray && (
        <div>
          <SimpleButton onClick={() => increaseSize()}>Add</SimpleButton>
          <SizedBox inline width={10} />
          <SimpleButton onClick={() => decreaseSize()}>Remove</SimpleButton>
        </div>
      )}
    </div>
  );
}

function initFclArrayOfSize(size: number): FclArrayValue {
  return Array.from({ length: size }).map(() => undefined);
}
