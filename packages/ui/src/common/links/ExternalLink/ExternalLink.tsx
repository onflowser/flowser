import React, { ReactNode, ReactElement, CSSProperties } from "react";
import { FlowserIcon } from "../../icons/FlowserIcon";
import classes from "./ExternalLink.module.scss";

export type ExternalLinkProps = {
  children?: ReactNode;
  href: string;
  inline?: boolean;
  style?: CSSProperties;
};

export function ExternalLink({
  href,
  children,
  inline,
  style,
}: ExternalLinkProps): ReactElement {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      className={classes.root}
      style={{ display: "flex", ...style }}
    >
      {!inline && <FlowserIcon.Link className={classes.icon} />}
      {children ?? <span className={classes.url}>{prettifyUrl(href)}</span>}
    </a>
  );
}

function prettifyUrl(url: string) {
  return url.replace(/https?:\/\//, "").replace(/www\./, "");
}
