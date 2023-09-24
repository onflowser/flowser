import { ExternalLink } from "./ExternalLink";
import { FlowserIcon } from "../icons/Icons";
import React, { ReactElement } from "react";

type IdeLinkProps = {
  filePath: string;
};

function VsCode(props: IdeLinkProps): ReactElement {
  return (
    <ExternalLink
      // https://github.com/Microsoft/vscode-docs/blob/main/docs/editor/command-line.md#opening-vs-code-with-urls
      href={`vscode://file/${props.filePath}`}
      inline
    >
      <FlowserIcon.VsCode size={25} />
    </ExternalLink>
  );
}

function WebStorm(props: IdeLinkProps): ReactElement {
  return (
    <ExternalLink
      // https://youtrack.jetbrains.com/issue/WEB-54529/How-to-open-the-link-webstorm-file-xxx-1.js11-in-the-browser-to-call-webstorm-to-open-the-code-file-what-is-the-correct-format.
      href={`webstorm://open?file=${props.filePath}`}
      inline
    >
      <FlowserIcon.WebStorm size={25} />
    </ExternalLink>
  );
}

function IntellijIdea(props: IdeLinkProps): ReactElement {
  return (
    <ExternalLink
      // https://youtrack.jetbrains.com/issue/WEB-54529/How-to-open-the-link-webstorm-file-xxx-1.js11-in-the-browser-to-call-webstorm-to-open-the-code-file-what-is-the-correct-format.
      href={`idea://open?file=${props.filePath}`}
      inline
    >
      <FlowserIcon.IntellijIdea size={25} />
    </ExternalLink>
  );
}

export const IdeLink = {
  VsCode,
  WebStorm,
  IntellijIdea,
};
