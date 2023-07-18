import React, { ReactElement } from "react";
import { ParameterBuilder } from "./parameter-builder";

export function TextualParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;
  return (
    <input
      type="text"
      value={String(parameterValue)}
      onChange={(e) => setParameterValue(e.target.value)}
    />
  );
}
