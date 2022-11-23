import { Spinner } from "components/spinner/Spinner";
import React, { ReactElement } from "react";
import classes from "./Loader.module.scss";
import { useProgressDots } from "../../../../hooks/use-progress-dots";

export type UpdateLoaderProps = {
  loadingPercentage: number;
};

export function UpdateLoader({
  loadingPercentage,
}: UpdateLoaderProps): ReactElement {
  const { dots } = useProgressDots();
  return (
    <>
      <div className={classes.background} />
      <div className={classes.root}>
        <Spinner className={classes.loader} size={60} />
        <span className={classes.title}>
          Installing update ({loadingPercentage}%) {dots}
        </span>
      </div>
    </>
  );
}
