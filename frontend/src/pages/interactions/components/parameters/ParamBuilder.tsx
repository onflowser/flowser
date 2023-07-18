import React from "react";
import { CadenceTypeKind } from "@flowser/shared";
import { ReactElement } from "react";
import { ParameterBuilder } from "./parameter-builder";
import { TextualParamBuilder } from "./TextualParamBuilder";

export function ParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterType } = props;
  switch (parameterType.kind) {
    case CadenceTypeKind.CADENCE_TYPE_TEXTUAL:
      return <TextualParamBuilder {...props} />;
    default:
      return <div>Unknown type</div>;
  }
}
