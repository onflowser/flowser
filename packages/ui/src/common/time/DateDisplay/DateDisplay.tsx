import React, { ReactElement } from "react";
import classes from "./DateDisplay.module.scss";
import { TextUtils } from "../../../utils/text-utils";

type DateDisplayProps = {
  date: string;
};

export function DateDisplay(props: DateDisplayProps): ReactElement {
  return <span className={classes.root}>{TextUtils.longDate(props.date)}</span>;
}
