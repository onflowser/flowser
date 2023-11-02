import React, { ReactElement } from "react";
import classes from "./DateDisplay.module.scss";
import { TextUtils } from "../../../utils/text-utils";

type DateDisplayProps = {
  date: string | Date;
};

export function DateDisplay(props: DateDisplayProps): ReactElement {
  const formattedDate =
    typeof props.date === "string" ? props.date : props.date.toISOString();
  return (
    <span className={classes.root}>{TextUtils.longDate(formattedDate)}</span>
  );
}
