import React, { FunctionComponent } from "react";
import Card from "../../../../components/card/Card";
import classes from "./TransactionSource.module.scss";
import Label from "../../../../components/label/Label";
import MiddleEllipsis from "../../../../components/ellipsis/MiddleEllipsis";
import Value from "../../../../components/value/Value";
import { TransactionArgument } from "@flowser/shared";
import { CadenceEditor } from "../../../../components/cadence-editor/CadenceEditor";
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
