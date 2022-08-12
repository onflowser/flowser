import React, { FunctionComponent } from "react";
import { useSyntaxHighlighter } from "../../hooks/use-syntax-highlighter";
import "./CadenceSourceCode.module.scss";

type CadenceSourceCodeProps = {
  script: string;
};

const CadenceSourceCode: FunctionComponent<CadenceSourceCodeProps> = ({
  script,
}) => {
  const { highlightCadenceSyntax } = useSyntaxHighlighter();
  const highlighted = highlightCadenceSyntax(script);

  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: highlighted }}></code>
    </pre>
  );
};

export default CadenceSourceCode;
