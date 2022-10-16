import React, { ReactElement } from "react";
import { CadenceEditor } from "../cadence-editor/CadenceEditor";

export type TransactionErrorMessageProps = {
  errorMessage: string;
};

export function TransactionErrorMessage({
  errorMessage,
}: TransactionErrorMessageProps): ReactElement {
  return <CadenceEditor value={errorMessage} editable={false} />;
}
