import React, { ReactElement } from "react";
import { ParameterBuilder } from "./parameter-builder";

export function NumericParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;
  return (
    <input
      type="number"
      value={Number(parameterValue)}
      onChange={(e) => setParameterValue(e.target.valueAsNumber)}
    />
  );
}
