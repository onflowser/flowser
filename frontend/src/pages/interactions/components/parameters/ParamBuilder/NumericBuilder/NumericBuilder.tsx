import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import Input from "../../../../../../components/input/Input";
import { FclValues } from "@flowser/shared";

export function NumericBuilder(props: CadenceValueBuilder): ReactElement {
  const { value, setValue } = props;

  const isInitialised = FclValues.isFclNumericValue(value);

  useEffect(() => {
    if (!isInitialised) {
      setValue(0);
    }
  }, [isInitialised]);

  if (!isInitialised) {
    return <></>;
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.valueAsNumber)}
    />
  );
}
