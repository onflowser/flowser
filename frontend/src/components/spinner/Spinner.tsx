import React, { ReactElement } from "react";
import classes from "./Spinner.module.scss";

export type SpinnerProps = {
  size: number;
  borderWidth?: number;
};

export function Spinner({ size, borderWidth = 2 }: SpinnerProps): ReactElement {
  const adjustedSize = size - borderWidth;
  return (
    <div
      className={classes.spinner}
      style={{ width: adjustedSize, height: adjustedSize, borderWidth }}
    />
  );
}
