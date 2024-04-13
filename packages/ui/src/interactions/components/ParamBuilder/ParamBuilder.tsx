import React from "react";
import { ReactElement } from "react";
import { ValueBuilder } from "../ValueBuilder/ValueBuilder";
import { InteractionParameterBuilder } from "../../contexts/definition.context";
import classes from "./ParamBuilder.module.scss";
import { CadenceValueBuilder } from "../ValueBuilder/interface";
import { CadenceParameter } from "@onflowser/api";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { FlixV1Argument, FlixV1Template } from "@onflowser/core";

export type ParameterListBuilderProps = InteractionParameterBuilder & {
  parameters: CadenceParameter[];
  flixTemplate: FlixV1Template | undefined;
};

export function ParamListBuilder(
  props: ParameterListBuilderProps,
): ReactElement {
  const { flixTemplate, parameters, fclValuesByIdentifier, setFclValue } = props;
  return (
    <div className={classes.paramListRoot}>
      {parameters.map((parameter) => (
        <ParamBuilder
          key={parameter.identifier}
          parameter={parameter}
          value={fclValuesByIdentifier.get(parameter.identifier)}
          setValue={(value) => setFclValue(parameter.identifier, value)}
          flixArgument={flixTemplate?.data?.arguments?.[parameter.identifier]}
        />
      ))}
    </div>
  );
}

export type ParameterBuilderProps = Omit<CadenceValueBuilder, "type"> & {
  parameter: CadenceParameter;
  flixArgument: FlixV1Argument | undefined;
};

export function ParamBuilder(props: ParameterBuilderProps): ReactElement {
  const { parameter, flixArgument, ...valueBuilderProps } = props;
  if (!parameter.type) {
    throw new Error("Expected parameter.type");
  }

  const description = flixArgument?.messages?.title?.i18n?.["en-US"];

  return (
    <div className={classes.paramRoot}>
      <div className={classes.label}>
        <b className={classes.identifier}>{parameter.identifier}</b>
        {"  "}
        <code className={classes.type}>{parameter.type.rawType}</code>
      </div>
      {description && (
        <span className={classes.description}>{description}</span>
      )}
      <SizedBox height={10} />
      <ValueBuilder type={parameter.type} {...valueBuilderProps} />
    </div>
  );
}
