import React, { ReactElement } from "react";
import { ParameterBuilder } from "../interface";
import Input from "../../../../../../components/input/Input";

export function TextualParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;
  return (
    <Input
      type="text"
      value={String(parameterValue ?? "")}
      onChange={(e) => setParameterValue(e.target.value)}
    />
  );
}
