import React, { FunctionComponent } from "react";
import CalendarIcon from "../../assets/icons/calendar.svg";
import classes from "./DateWithCalendar.module.scss";
import { useFormattedDate } from "../../hooks/use-formatted-date";

type DateWithCalendarProps = {
  date: string;
};

const DateWithCalendar: FunctionComponent<DateWithCalendarProps> = ({
  date,
}) => {
  const { formatDate } = useFormattedDate();
  return (
    <span className={classes.root}>
      <CalendarIcon className={classes.icon} />
      <span className={classes.date}>{formatDate(date)}</span>
    </span>
  );
};

export default DateWithCalendar;
