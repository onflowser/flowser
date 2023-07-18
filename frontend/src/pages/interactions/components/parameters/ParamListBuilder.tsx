import React from "react";
import { CadenceType } from "@flowser/shared";
import { ReactElement } from "react";
import { ParamBuilder } from "./ParamBuilder";
import { InteractionParameterBuilder } from "../../contexts/definition.context";

export type ParameterListBuilderProps = InteractionParameterBuilder & {
  parameterTypes: CadenceType[];
};

export function ParamListBuilder(
  props: ParameterListBuilderProps
): ReactElement {
  const { parameterTypes, parameterValuesByIndex, setParameterValueByIndex } =
    props;
  return (
    <div>
      {parameterTypes.map((paramType, index) => (
        <ParamBuilder
          key={JSON.stringify(paramType)}
          parameterType={paramType}
          parameterValue={parameterValuesByIndex.get(index)}
          setParameterValue={(value) => setParameterValueByIndex(index, value)}
        />
      ))}
    </div>
  );
}
