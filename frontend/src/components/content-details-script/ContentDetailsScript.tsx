import React, { FunctionComponent } from "react";
import CadenceSourceCode from "../cadence-source-code/CadenceSourceCode";
import Card from "../card/Card";
import classes from "./ContentDetailsScript.module.scss";
import Label from "../label/Label";
import Ellipsis from "../ellipsis/Ellipsis";
import Value from "../value/Value";
import CopyButton from "../copy-button/CopyButton";
import { CadenceObject } from "@flowser/types";
import { CadenceUtils } from "../../utils/cadence-utils";

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
                <Value className={classes.value}>
                  {CadenceUtils.getDisplayType(arg)}
                </Value>

                <Label>VALUE:</Label>
                <Value className={classes.value}>
                  <Ellipsis className={classes.argValue}>
                    {CadenceUtils.getDisplayValue(arg)}
                  </Ellipsis>
                </Value>

                {/* FIXME: fix getEventDataValue function */}
                {/*<CopyButton value={getEventDataValue(arg, true)} />*/}
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
