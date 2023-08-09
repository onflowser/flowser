import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";

type ScriptErrorProps = {
  errorMessage: string;
};

export function ScriptError({ errorMessage }: ScriptErrorProps): ReactElement {
  const parsedMessage = FlowUtils.parseScriptError(errorMessage);

  if (parsedMessage === undefined) {
    return <pre>{parsedMessage}</pre>;
  }

  return <pre>{parsedMessage.responseBody.message}</pre>;
}

type TransactionErrorProps = {
  errorMessage: string;
};

export function TransactionError(props: TransactionErrorProps): ReactElement {
  return <pre>{props.errorMessage}</pre>;
}
