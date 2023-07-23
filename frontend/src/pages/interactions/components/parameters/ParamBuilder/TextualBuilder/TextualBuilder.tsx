import React, { ReactElement, useEffect } from "react";
import { ParameterBuilder } from "../interface";
import Input from "../../../../../../components/input/Input";

export function TextualBuilder(props: ParameterBuilder): ReactElement {
  const { parameterValue, setParameterValue } = props;

  const isInitialised = typeof parameterValue === "string";

  useEffect(() => {
    if (!isInitialised) {
      setParameterValue("");
    }
  }, [isInitialised]);

  if (!isInitialised) {
    return <></>;
  }

  return (
    <Input
      type="text"
      value={parameterValue}
      onChange={(e) => setParameterValue(e.target.value)}
    />
  );
}
