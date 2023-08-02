import React, { ReactElement } from "react";
import classes from "./SimpleButton.module.scss";
import classNames from "classnames";

export type SimpleButtonProps =  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SimpleButton(
  props: SimpleButtonProps
): ReactElement {
  return (
    <button {...props} className={classNames(classes.root, props.className)} />
  );
}
