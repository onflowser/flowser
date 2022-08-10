import React, { FunctionComponent } from "react";
import CadenceSourceCode from "../cadence-source-code/CadenceSourceCode";
import Card from "../card/Card";
import classes from "./ContentDetailsScript.module.scss";
import Label from "../label/Label";
import Ellipsis from "../ellipsis/Ellipsis";
import Value from "../value/Value";
import CopyButton from "../copy-button/CopyButton";
import { getEventDataType, getEventDataValue } from "../../functions/events";
import { CadenceObject } from "@flowser/types/generated/entities/common";

export type ContentDetailsScriptProps = {
  script: string;
  args?: CadenceObject[];
};

const ContentDetailsScript: FunctionComponent<ContentDetailsScriptProps> = ({
  script,
  args,
}) => {
  return (
    <Card variant="black" className={classes.root}>
      {args?.length && (
        <>
          <div className={classes.params}>
            <Label className={classes.argsTitle}>ARGS:</Label>

            {args.map((arg, index) => (
              <div key={index} className={classes.argListItem}>
                <span>{">"}</span>
                <Label>ARG:</Label>
                <Value className={classes.value}>{`{${index}}`}</Value>

                <Label>TYPE:</Label>
                <Value className={classes.value}>{getEventDataType(arg)}</Value>

                <Label>VALUE:</Label>
                <Value className={classes.value}>
                  <Ellipsis className={classes.argValue}>
                    {getEventDataValue(arg)}
                  </Ellipsis>
                </Value>

                <CopyButton value={getEventDataValue(arg, true)} />
              </div>
            ))}
          </div>
          <Label className={classes.codeTitle}>CODE:</Label>
        </>
      )}
      <CadenceSourceCode script={script} />
    </Card>
  );
};

export default ContentDetailsScript;
