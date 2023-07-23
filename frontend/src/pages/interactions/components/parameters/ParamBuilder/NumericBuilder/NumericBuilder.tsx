import React, { ReactElement, useEffect } from "react";
import { ParameterBuilder } from "../interface";
import Input from "../../../../../../components/input/Input";

export function NumericBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;

  const isInitialised = typeof parameterValue === "number";

  useEffect(() => {
    if (!isInitialised) {
      setParameterValue(0);
    }
  }, [isInitialised]);

  if (!isInitialised) {
    return <></>;
  }

  return (
    <Input
      type="number"
      value={parameterValue}
      onChange={(e) => setParameterValue(e.target.valueAsNumber)}
    />
  );
}
