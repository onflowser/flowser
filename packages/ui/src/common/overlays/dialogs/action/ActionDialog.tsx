import React, { FC, ReactElement } from "react";
import classes from "./ActionDialog.module.scss";
import classNames from "classnames";
import { BaseDialog, DialogProps } from "../base/BaseDialog";

export type ActionDialogProps = {
  title: string;
  footer?: ReactElement;
  bodyClass?: string;
} & DialogProps;

export const ActionDialog: FC<ActionDialogProps> = ({
  title,
  footer,
  children,
  bodyClass,
  ...dialogProps
}) => {
  return (
    <BaseDialog {...dialogProps}>
      <div className={classes.root}>
        <h3>{title}</h3>
        <div className={classNames(classes.body, bodyClass)}>{children}</div>
        {footer && <div className={classes.actions}>{footer}</div>}
      </div>
    </BaseDialog>
  );
};
