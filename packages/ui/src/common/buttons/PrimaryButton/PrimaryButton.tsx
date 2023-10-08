import React, { ReactElement } from "react";
import classNames from "classnames";
import { SimpleButton, SimpleButtonProps } from "../SimpleButton/SimpleButton";
import classes from "./PrimaryButton.module.scss";

type PrimaryButtonProps = SimpleButtonProps;

export function PrimaryButton(props: PrimaryButtonProps): ReactElement {
  return (
    <SimpleButton
      {...props}
      className={classNames(props.className, classes.root)}
    />
  );
}
