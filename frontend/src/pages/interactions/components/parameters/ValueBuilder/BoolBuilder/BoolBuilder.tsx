import React, { ReactElement, useEffect } from "react";
import { CadenceValueBuilder } from "../interface";
import { FclValues } from "@flowser/shared";
import SelectInput from "../../../../../../components/select-input/SelectInput";

export function BoolBuilder(props: CadenceValueBuilder): ReactElement {
  const { value, setValue } = props;

  const isInitialised = FclValues.isFclBoolValue(value);

  useEffect(() => {
    if (!isInitialised) {
      setValue(false);
    }
  }, [isInitialised]);

  if (!isInitialised) {
    return <></>;
  }

  return (
    <SelectInput
      value={String(value)}
      options={[
        {
          value: "true",
          label: "True",
        },
        {
          value: "false",
          label: "False",
        },
      ]}
      onChange={(event) => {
        switch (event.target.value) {
          case "true":
            return setValue(true);
          case "false":
            return setValue(false);
          default:
            throw new Error(
              "Unknown selected option value: " + event.target.value
            );
        }
      }}
    />
  );
}
