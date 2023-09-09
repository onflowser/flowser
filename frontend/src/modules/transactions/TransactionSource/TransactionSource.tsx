import React, { FC } from "react";
import Card from "../../../components/card/Card";
import classes from "./TransactionSource.module.scss";
import { TransactionArgument } from "@flowser/shared";
import { CadenceEditor } from "../../../components/cadence-editor/CadenceEditor";
import { ParamBuilder } from "../../interactions/components/ParamBuilder/ParamBuilder";
import { SizedBox } from "../../../components/sized-box/SizedBox";

type TransactionSourceProps = {
  code: string;
  arguments: TransactionArgument[];
};

export const TransactionSource: FC<TransactionSourceProps> = ({
  code,
  arguments: args,
}) => {
  return (
    <Card className={classes.root}>
      {args.length > 0 && (
        <div className={classes.left}>
          <h3>Arguments</h3>
          <SizedBox height={20} />
          <div className={classes.argumentsWrapper}>
            {args.map((arg) => (
              <ParamBuilder
                key={arg.identifier}
                disabled
                value={JSON.parse(arg.valueAsJson)}
                setValue={console.log}
                parameter={arg}
              />
            ))}
          </div>
        </div>
      )}
      <div className={classes.right}>
        <CadenceEditor value={code} editable={false} />
      </div>
    </Card>
  );
};
