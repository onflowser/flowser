import { CadenceType } from "@flowser/shared";
import { ReactElement } from "react";
import { ParamBuilder } from "./ParamBuilder";

export type ParameterListBuilderProps = {
  parameterTypes: CadenceType[];
};

export function ParamListBuilder(
  props: ParameterListBuilderProps
): ReactElement {
  return (
    <div>
      {props.parameterTypes.map((paramType) => (
        <ParamBuilder parameterType={paramType} />
      ))}
    </div>
  );
}
