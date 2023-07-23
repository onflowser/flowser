import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import Input from "../../../../../../components/input/Input";

export function TextualBuilder(props: CadenceValueBuilder): ReactElement {
  const { value, setValue } = props;

  const isInitialised = typeof value === "string";

  useEffect(() => {
    if (!isInitialised) {
      setValue("");
    }
  }, [isInitialised]);

  if (!isInitialised) {
    return <></>;
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
