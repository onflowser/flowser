import React, { FC, useEffect, useState } from "react";
import classes from "./FullScreenLoading.module.scss";
import classNames from "classnames";
import { Spinner } from "../spinner/Spinner";

type FullScreenLoadingProps = {
  dotInterval?: number;
  className?: string;
};

const FullScreenLoading: FC<FullScreenLoadingProps> = ({
  dotInterval = 300,
  className,
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotArray = [".", "..", "...", "...."];
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDots(dotArray[count % dotArray.length]);
    }, dotInterval);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classNames(classes.container, className)}>
      <Spinner className={classes.logo} size={100} borderWidth={6} />
      <p className={classes.text}>Loading {dots}</p>
    </div>
  );
};

export default FullScreenLoading;
