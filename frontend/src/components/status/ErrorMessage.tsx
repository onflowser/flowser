import React, { ReactElement } from "react";
import { TextUtils } from "../../utils/text-utils";

export type TransactionErrorMessageProps = {
  errorMessage: string;
};

export function TransactionErrorMessage({
  errorMessage,
}: TransactionErrorMessageProps): ReactElement {
  return (
    <pre
      style={{ height: 500, overflow: "scroll" }}
      dangerouslySetInnerHTML={{
        __html: TextUtils.highlightCadenceSyntax(errorMessage).replaceAll(
          "\\n",
          "<br/>"
        ),
      }}
    />
  );
}
