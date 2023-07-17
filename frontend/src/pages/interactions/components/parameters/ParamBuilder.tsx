import React from "react";
import { CadenceTypeKind } from "@flowser/shared";
import { ReactElement } from "react";
import { ParameterBuilder } from "./parameter-builder";
import { TextualParamBuilder } from "./TextualParamBuilder";
import { Spinner } from "../../../../components/spinner/Spinner";

export function ParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterType } = props;
  switch (parameterType.kind) {
    case CadenceTypeKind.CADENCE_TYPE_TEXTUAL:
      return <TextualParamBuilder parameterType={parameterType} />;
    default:
      return <Spinner size={10} />;
  }
}
