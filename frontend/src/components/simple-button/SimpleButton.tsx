import React, { ReactElement } from "react";
import classes from "./SimpleButton.module.scss";
import classNames from "classnames";

export function SimpleButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
): ReactElement {
  return (
    <button {...props} className={classNames(classes.root, props.className)} />
  );
}
