import React, { ReactChild, ReactElement } from "react";
import { FlowserIcon } from "../icons/Icons";
import classes from "./ExternalLink.module.scss";

export type ExternalLinkProps = {
  children?: ReactChild;
  href: string;
};

export function ExternalLink({
  href,
  children,
}: ExternalLinkProps): ReactElement {
  return (
    <a target="_blank" rel="noreferrer" href={href} className={classes.root}>
      <FlowserIcon.Link className={classes.icon} />
      {children ?? prettifyUrl(href)}
    </a>
  );
}

function prettifyUrl(url: string) {
  return url.replace(/https?:\/\//, "");
}
