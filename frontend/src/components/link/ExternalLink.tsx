import React, { ReactChild, ReactElement } from "react";

export type ExternalLinkProps = {
  children?: ReactChild;
  href: string;
};

export function ExternalLink({
  href,
  children,
}: ExternalLinkProps): ReactElement {
  return (
    <a target="_blank" rel="noreferrer" href={href}>
      {children ?? prettifyUrl(href)}
    </a>
  );
}

function prettifyUrl(url: string) {
  return url.replace(/https?:\/\//, "");
}
