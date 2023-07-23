import React from "react";
import { Parameter } from "@flowser/shared";
import { ReactElement } from "react";
import { ParamBuilder } from "../ParamBuilder/ParamBuilder";
import { InteractionParameterBuilder } from "../../../contexts/definition.context";
import classes from "./ParamListBuilder.module.scss";

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
    <div className={classes.root}>
      {parameters.map((parameter) => {
        if (!parameter.type) {
          throw new Error("Expected parameter.type");
        }

        return (
          <div key={parameter.identifier} className={classes.parameter}>
            <div className={classes.label}>
              <b>{parameter.identifier}</b>{" "}
              <code>{parameter.type.rawType}</code>
            </div>
            <ParamBuilder
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