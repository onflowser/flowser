import React, { ReactChild, ReactElement } from "react";
import { FlowserIcon } from "../icons/Icons";
import classes from "./ExternalLink.module.scss";

export type ExternalLinkProps = {
  children?: ReactChild;
  href: string;
  inline?: boolean;
};

export function ExternalLink({
  href,
  children,
  inline,
}: ExternalLinkProps): ReactElement {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      className={classes.root}
      style={{ display: inline ? "inline" : "flex" }}
    >
      {!inline && <FlowserIcon.Link className={classes.icon} />}
      {children ?? <span className={classes.url}>{prettifyUrl(href)}</span>}
    </a>
  );
}

function prettifyUrl(url: string) {
  return url.replace(/https?:\/\//, "");
}
