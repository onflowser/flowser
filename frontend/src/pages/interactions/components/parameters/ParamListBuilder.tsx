import React from "react";
import { Parameter } from "@flowser/shared";
import { ReactElement } from "react";
import { ParamBuilder } from "./ParamBuilder";
import { InteractionParameterBuilder } from "../../contexts/definition.context";

export type ParameterListBuilderProps = InteractionParameterBuilder & {
  parameters: Parameter[];
};

export function ParamListBuilder(
  props: ParameterListBuilderProps
): ReactElement {
  const {
    parameters,
    parameterValuesByIdentifier,
    setParameterValueByIdentifier,
  } = props;
  return (
    <div>
      {parameters.map((parameter) => {
        if (!parameter.type) {
          throw new Error("Expected parameter.type");
        }

        return (
          <div>
            <code>{parameter.identifier}</code>
            <ParamBuilder
              key={parameter.identifier}
              parameterType={parameter.type}
              parameterValue={parameterValuesByIdentifier.get(
                parameter.identifier
              )}
              setParameterValue={(value) =>
                setParameterValueByIdentifier(parameter.identifier, value)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
