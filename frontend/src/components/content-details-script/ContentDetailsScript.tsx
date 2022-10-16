import React, { FunctionComponent } from "react";
import Card from "../card/Card";
import classes from "./ContentDetailsScript.module.scss";
import Label from "../label/Label";
import MiddleEllipsis from "../ellipsis/MiddleEllipsis";
import Value from "../value/Value";
import { CadenceObject } from "@flowser/shared";
import { CadenceUtils } from "../../utils/cadence-utils";
import { CadenceEditor } from "../cadence-editor/CadenceEditor";

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
      {args && args.length > 0 && (
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
                  <MiddleEllipsis className={classes.argValue}>
                    {CadenceUtils.getDisplayValue(arg)}
                  </MiddleEllipsis>
                </Value>

                {/* FIXME: fix getEventDataValue function */}
                {/*<CopyButton value={getEventDataValue(arg, true)} />*/}
              </div>
            ))}
          </div>
          <Label className={classes.codeTitle}>CODE:</Label>
        </>
      )}
      <CadenceEditor value={script} editable={false} />
    </Card>
  );
};

export default ContentDetailsScript;
