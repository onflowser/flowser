import React from "react";
import { Parameter } from "@flowser/shared";
import { ReactElement } from "react";
import { ValueBuilder } from "../ValueBuilder/ValueBuilder";
import { InteractionParameterBuilder } from "../../contexts/definition.context";
import classes from "./ParamBuilder.module.scss";
import { CadenceValueBuilder } from "../ValueBuilder/interface";

export type ParameterListBuilderProps = InteractionParameterBuilder & {
  parameters: Parameter[];
};

export function ParamListBuilder(
  props: ParameterListBuilderProps
): ReactElement {
  const { parameters, fclValuesByIdentifier, setFclValue } = props;
  return (
    <div className={classes.paramListRoot}>
      {parameters.map((parameter) => (
        <ParamBuilder
          key={parameter.identifier}
          parameter={parameter}
          value={fclValuesByIdentifier.get(parameter.identifier)}
          setValue={(value) => setFclValue(parameter.identifier, value)}
        />
      ))}
    </div>
  );
}

export type ParameterBuilderProps = Omit<CadenceValueBuilder, "type"> & {
  parameter: Parameter;
};

export function ParamBuilder(props: ParameterBuilderProps): ReactElement {
  const { parameter, ...valueBuilderProps } = props;
  if (!parameter.type) {
    throw new Error("Expected parameter.type");
  }

  return (
    <div className={classes.paramRoot}>
      <div className={classes.label}>
        <b className={classes.identifier}>{parameter.identifier}</b>
        {"  "}
        <code className={classes.type}>{parameter.type.rawType}</code>
      </div>
      <ValueBuilder type={parameter.type} {...valueBuilderProps} />
    </div>
  );
}
