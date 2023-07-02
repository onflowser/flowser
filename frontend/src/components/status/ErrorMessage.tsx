import React, { ReactElement } from "react";
import { CadenceUtils } from "utils/cadence-utils";
import { JsonView } from "../json-view/JsonView";

export type TransactionErrorMessageProps = {
  errorMessage: string;
};

export function TransactionErrorMessage({
  errorMessage,
}: TransactionErrorMessageProps): ReactElement {
  const parsedMessage = CadenceUtils.parseCadenceError(errorMessage);
  return <JsonView data={parsedMessage} />;
}
