import { Spinner } from "components/spinner/Spinner";
import React, { ReactElement } from "react";
import classes from "./ExitLoader.module.scss";
import { useProgressDots } from "../../../../hooks/use-progress-dots";

export function ExitLoader(): ReactElement {
  const { dots } = useProgressDots();
  return (
    <>
      <div className={classes.background} />
      <div className={classes.root}>
        <Spinner className={classes.loader} size={60} />
        <span className={classes.title}>Flowser is exiting {dots}</span>
      </div>
    </>
  );
}
