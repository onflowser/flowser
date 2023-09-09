import React, { ReactElement } from "react";
import { TextUtils } from "../../../utils/text-utils";
import classes from "./DateDisplay.module.scss";

type DateDisplayProps = {
  date: string;
};

export function DateDisplay(props: DateDisplayProps): ReactElement {
  return <span className={classes.root}>{TextUtils.longDate(props.date)}</span>;
}
