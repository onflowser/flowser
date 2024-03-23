import React, { ReactNode, ReactElement, CSSProperties } from "react";
import { FlowserIcon } from "../../icons/FlowserIcon";
import classes from "./ExternalLink.module.scss";
import classNames from "classnames";

export type ExternalLinkProps = {
  children?: ReactNode;
  href: string;
  inline?: boolean;
  style?: CSSProperties;
  className?: string;
};

export function ExternalLink({
  href,
  children,
  inline,
  style,
  className
}: ExternalLinkProps): ReactElement {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      className={classNames(classes.root, className)}
      style={{ display: inline ? "inline-block" : "flex", ...style }}
    >
      {!inline && <FlowserIcon.Link className={classes.icon} />}
      {children ?? <span className={classes.url}>{prettifyUrl(href)}</span>}
    </a>
  );
}

function prettifyUrl(url: string) {
  return url
    .replace(/https?:\/\//, "")
    .replace(/www\./, "")
    .replace(/\/$/, "");
}
