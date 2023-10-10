import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import { Input } from "../../../../common/inputs/Input/Input";
import { FclValueUtils } from "@onflowser/core";

export function IntegerNumberBuilder(props: CadenceValueBuilder): ReactElement {
  const { disabled, value, setValue } = props;

  const isInitialised = FclValueUtils.isFclIntegerNumberValue(value);

  // TODO(polish): Don't trigger this hook on every rerender
  //  See: https://www.notion.so/flowser/Sometimes-arguments-don-t-get-initialized-properly-80c34018155646d08e4da0bc6c977ed9?pvs=4
  useEffect(() => {
    if (!isInitialised) {
      setValue("0");
    }
  });

  if (!isInitialised) {
    return <></>;
  }

  return (
    <Input
      type="number"
      disabled={disabled}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
