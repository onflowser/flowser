import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./ErrorMessage.module.scss";

type ScriptErrorProps = {
  errorMessage: string;
};

export function ScriptError({ errorMessage }: ScriptErrorProps): ReactElement {
  const parsedMessage = FlowUtils.parseScriptError(errorMessage);

  return (
    <pre className={classes.root}>
      {parsedMessage === undefined
        ? errorMessage
        : parsedMessage.responseBody.message}
    </pre>
  );
}

type TransactionErrorProps = {
  errorMessage: string;
};

export function TransactionError(props: TransactionErrorProps): ReactElement {
  return <pre className={classes.root}>{props.errorMessage}</pre>;
}
