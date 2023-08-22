import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./ErrorMessage.module.scss";
import { JsonView } from "../json-view/JsonView";

type ScriptErrorProps = {
  errorMessage: string;
};

export function ScriptError({ errorMessage }: ScriptErrorProps): ReactElement {
  const parsedMessage = FlowUtils.parseScriptError(errorMessage);

  if (parsedMessage === undefined) {
    return <pre className={classes.root}>{errorMessage}</pre>;
  }

  if (parsedMessage.responseBody?.message) {
    return (
      <pre className={classes.root}>{parsedMessage.responseBody.message}</pre>
    );
  }

  return (
    <JsonView className={classes.root} name="error" data={parsedMessage} />
  );
}

type TransactionErrorProps = {
  errorMessage: string;
};

export function TransactionError(props: TransactionErrorProps): ReactElement {
  return <pre className={classes.root}>{props.errorMessage}</pre>;
}
