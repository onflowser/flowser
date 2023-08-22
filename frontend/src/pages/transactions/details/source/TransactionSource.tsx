import React, { FunctionComponent } from "react";
import Card from "@flowser/ui/cards/base/Card";
import classes from "./TransactionSource.module.scss";
import Label from "@flowser/uimisc/Label/Label";
import MiddleEllipsis from "@flowser/ui/ellipsis/MiddleEllipsis";
import Value from "@flowser/uimisc/Value/Value";
import { TransactionArgument } from "@flowser/shared";
import { CadenceEditor } from "@flowser/ui/code/cadence/CadenceEditor";
import CopyButton from "components/buttons/copy-button/CopyButton";

type TransactionSourceProps = {
  code: string;
  arguments: TransactionArgument[];
};

export const TransactionSource: FunctionComponent<TransactionSourceProps> = ({
  code,
  arguments: args,
}) => {
  return (
    <Card className={classes.root}>
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
      <CadenceEditor value={code} editable={false} />
    </Card>
  );
};
