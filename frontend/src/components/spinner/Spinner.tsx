import classNames from "classnames";
import React, { ReactElement } from "react";
import classes from "./Spinner.module.scss";

export type SpinnerProps = {
  size: number;
  borderWidth?: number;
  className?: string;
};

export function Spinner({
  size,
  borderWidth = 2,
  className,
}: SpinnerProps): ReactElement {
  const adjustedSize = size - borderWidth;
  return (
    <div
      className={classNames(classes.spinner, className)}
      style={{ width: adjustedSize, height: adjustedSize, borderWidth }}
    />
  );
}
