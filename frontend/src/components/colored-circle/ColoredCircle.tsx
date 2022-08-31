import React, { Fragment, FunctionComponent } from "react";
import classes from "./ColloredCircle.module.scss";

type ColoredCircleProps = {
  color: string;
};

const ColoredCircle: FunctionComponent<ColoredCircleProps> = ({ color }) => {
  const styles = { backgroundColor: color };

  return color ? (
    <Fragment>
      <span className={classes.coloredCircle} style={styles} />
    </Fragment>
  ) : null;
};

export default ColoredCircle;
