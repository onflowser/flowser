import React, { ReactElement } from "react";
import { useSyntaxHighlighter } from "../../hooks/use-syntax-highlighter";

export type TransactionErrorMessageProps = {
  errorMessage: string;
};

export function TransactionErrorMessage({
  errorMessage,
}: TransactionErrorMessageProps): ReactElement {
  const { highlightCadenceSyntax } = useSyntaxHighlighter();
  const highlightedError = highlightCadenceSyntax(errorMessage);

  return (
    <pre
      style={{ height: 500, overflow: "scroll" }}
      dangerouslySetInnerHTML={{
        __html: highlightedError.replaceAll("\\n", "<br/>"),
      }}
    />
  );
}
