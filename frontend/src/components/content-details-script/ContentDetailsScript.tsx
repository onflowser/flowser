import React, { FunctionComponent } from "react";
import Card from "../card/Card";
import classes from "./ContentDetailsScript.module.scss";
import Label from "../label/Label";
import MiddleEllipsis from "../ellipsis/MiddleEllipsis";
import Value from "../value/Value";
import { TransactionArgument } from "@flowser/shared";
import { CadenceEditor } from "../cadence-editor/CadenceEditor";
import CopyButton from "components/copy-button/CopyButton";

export type ContentDetailsScriptProps = {
  script: string;
  arguments?: TransactionArgument[];
};

const ContentDetailsScript: FunctionComponent<ContentDetailsScriptProps> = ({
  script,
  arguments: args,
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
                <Value className={classes.value}>{arg.type?.rawType}</Value>

                <Label>VALUE:</Label>
                <Value className={classes.value}>
                  <MiddleEllipsis className={classes.argValue}>
                    {arg.valueAsJson}
                  </MiddleEllipsis>
                </Value>

                <CopyButton value={arg.valueAsJson} />
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
