import React, { FunctionComponent } from "react";
import "./CadenceSourceCode.module.scss";
import { TextUtils } from "../../utils/text-utils";

type CadenceSourceCodeProps = {
  script: string;
};

const CadenceSourceCode: FunctionComponent<CadenceSourceCodeProps> = ({
  script,
}) => {
  return (
    <pre>
      <code
        dangerouslySetInnerHTML={{
          __html: TextUtils.highlightCadenceSyntax(script),
        }}
      ></code>
    </pre>
  );
};

export default CadenceSourceCode;
