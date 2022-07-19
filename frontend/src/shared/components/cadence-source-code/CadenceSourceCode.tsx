import React, { FunctionComponent } from "react";
import { useSyntaxHighlighter } from "../../hooks/syntax-highlighter";
import "./CadenceSourceCode.module.scss";

interface OwnProps {
  script: string;
}

type Props = OwnProps;

const CadenceSourceCode: FunctionComponent<Props> = ({ script }) => {
  const { highlightCadenceSyntax } = useSyntaxHighlighter();
  const highlighted = highlightCadenceSyntax(script);

  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: highlighted }}></code>
    </pre>
  );
};

export default CadenceSourceCode;
