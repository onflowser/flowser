import React, { FunctionComponent } from "react";
import ReactTimeAgo from "react-timeago";
import { ReactComponent as ClockIcon } from "../../assets/icons/clock.svg";
import classes from "./TimeAgo.module.scss";

type TimeAgoProps = {
  date: string;
};

const TimeAgo: FunctionComponent<TimeAgoProps> = ({ date }) => {
  return (
    <span className={classes.root}>
      <ClockIcon className={classes.icon} />
      <ReactTimeAgo className={classes.date} date={date} />
    </span>
  );
};

export default TimeAgo;
