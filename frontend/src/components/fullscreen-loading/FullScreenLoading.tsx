import React, { FC } from "react";
import classes from "./FullScreenLoading.module.scss";
import classNames from "classnames";
import { Spinner } from "../spinner/Spinner";

type FullScreenLoadingProps = {
  className?: string;
};

const FullScreenLoading: FC<FullScreenLoadingProps> = ({ className }) => {
  return (
    <div className={classNames(classes.container, className)}>
      <div className={classes.logo}>
        <Spinner size={60} borderWidth={6} />
      </div>
      <p className={classes.text}>Loading</p>
    </div>
  );
};

export default FullScreenLoading;
