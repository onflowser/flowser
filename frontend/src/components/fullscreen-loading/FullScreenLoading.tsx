import React, { FC } from "react";
import classes from "./FullScreenLoading.module.scss";
import classNames from "classnames";
import { Spinner } from "../spinner/Spinner";
import { useProgressDots } from "../../hooks/use-progress-dots";

type FullScreenLoadingProps = {
  className?: string;
};

const FullScreenLoading: FC<FullScreenLoadingProps> = ({ className }) => {
  const { dots } = useProgressDots();

  return (
    <div className={classNames(classes.container, className)}>
      <Spinner className={classes.logo} size={60} borderWidth={6} />
      <p className={classes.text}>Loading {dots}</p>
    </div>
  );
};

export default FullScreenLoading;
