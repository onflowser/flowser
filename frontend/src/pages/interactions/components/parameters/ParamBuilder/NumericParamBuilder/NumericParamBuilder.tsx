import React, { ReactElement } from "react";
import { ParameterBuilder } from "../interface";
import Input from "../../../../../../components/input/Input";

export function NumericParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;
  return (
    <Input
      type="number"
      value={Number(parameterValue)}
      onChange={(e) => setParameterValue(e.target.valueAsNumber)}
    />
  );
}
