import React from "react";
import { CadenceTypeKind } from "@flowser/shared";
import { ReactElement } from "react";
import { ParameterBuilder } from "./interface";
import { TextualBuilder } from "./TextualBuilder/TextualBuilder";
import { NumericBuilder } from "./NumericBuilder/NumericBuilder";
import { ArrayBuilder } from "./ArrayBuilder/ArrayBuilder";
import { AddressBuilder } from "./AddressBuilder/AddressBuilder";

export function ParamBuilder(props: ParameterBuilder): ReactElement {
  const { parameterType } = props;
  switch (parameterType.kind) {
    case CadenceTypeKind.CADENCE_TYPE_ADDRESS:
      return <AddressBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_TEXTUAL:
      return <TextualBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_NUMERIC:
      return <NumericBuilder {...props} />;
    case CadenceTypeKind.CADENCE_TYPE_ARRAY:
      return <ArrayBuilder {...props} />;
    default:
      return <div>Unknown type</div>;
  }
}
