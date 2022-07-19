import React, { FunctionComponent } from "react";
import ReactTimeAgo from "react-timeago";
import { ReactComponent as ClockIcon } from "../../assets/icons/clock.svg";
import classes from "./TimeAgo.module.scss";

interface OwnProps {
  date: string;
}

type Props = OwnProps;

const TimeAgo: FunctionComponent<Props> = ({ date }) => {
  return (
    <span className={classes.root}>
      <ClockIcon className={classes.icon} />
      <ReactTimeAgo className={classes.date} date={date} />
    </span>
  );
};

export default TimeAgo;
