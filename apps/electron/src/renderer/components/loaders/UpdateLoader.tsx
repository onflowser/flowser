import React, { ReactElement } from 'react';
import { Spinner } from '../../../../../../packages/ui/src/common/loaders/Spinner/Spinner';
import classes from './Loader.module.scss';

export type UpdateLoaderProps = {
  loadingPercentage: number;
};

export function UpdateLoader({
  loadingPercentage,
}: UpdateLoaderProps): ReactElement {
  return (
    <>
      <div className={classes.background} />
      <div className={classes.root}>
        <Spinner className={classes.loader} size={60} />
        <span className={classes.title}>
          Installing update ({Math.round(loadingPercentage)}%)
        </span>
      </div>
    </>
  );
}
