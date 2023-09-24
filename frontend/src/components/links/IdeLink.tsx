import { ExternalLink, ExternalLinkProps } from "./ExternalLink";
import { FlowserIcon } from "../icons/Icons";
import React, { ReactElement } from "react";

type IdeLinkProps = {
  filePath: string;
};

const iconSize = 20;

function VsCode(props: IdeLinkProps): ReactElement {
  return (
    <Link
      // https://github.com/Microsoft/vscode-docs/blob/main/docs/editor/command-line.md#opening-vs-code-with-urls
      href={`vscode://file/${props.filePath}`}
    >
      <FlowserIcon.VsCode size={iconSize} />
    </Link>
  );
}

function WebStorm(props: IdeLinkProps): ReactElement {
  return (
    <Link
      // https://youtrack.jetbrains.com/issue/WEB-54529/How-to-open-the-link-webstorm-file-xxx-1.js11-in-the-browser-to-call-webstorm-to-open-the-code-file-what-is-the-correct-format.
      href={`webstorm://open?file=${props.filePath}`}
    >
      <FlowserIcon.WebStorm size={iconSize} />
    </Link>
  );
}

function IntellijIdea(props: IdeLinkProps): ReactElement {
  return (
    <Link
      // https://youtrack.jetbrains.com/issue/WEB-54529/How-to-open-the-link-webstorm-file-xxx-1.js11-in-the-browser-to-call-webstorm-to-open-the-code-file-what-is-the-correct-format.
      href={`idea://open?file=${props.filePath}`}
    >
      <FlowserIcon.IntellijIdea size={iconSize} />
    </Link>
  );
}

function Link(props: ExternalLinkProps) {
  return <ExternalLink style={{ opacity: 0.7 }} inline {...props} />;
}

export const IdeLink = {
  VsCode,
  WebStorm,
  IntellijIdea,
};
