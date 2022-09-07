import React, { FunctionComponent, MouseEventHandler } from "react";
import Dialog, { DialogProps } from "../dialog/Dialog";
import Button from "../button/Button";
import classes from "./ConfirmDialog.module.scss";

type ConfirmDialogProps = Pick<DialogProps, "onClose"> & {
  onClose: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onConfirm: MouseEventHandler<HTMLButtonElement> | undefined;
  confirmBtnLabel?: string;
  cancelBtnLabel?: string;
  className?: string;
};

const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = ({
  onConfirm,
  onClose,
  confirmBtnLabel = "OK",
  cancelBtnLabel = "CANCEL",
  children,
  className = "",
}) => {
  return (
    <Dialog className={className} onClose={onClose}>
      <div className={classes.root}>
        {children}
        <div className={classes.actions}>
          <Button outlined={true} variant="middle" onClick={onClose}>
            {cancelBtnLabel}
          </Button>
          <Button variant="middle" onClick={onConfirm}>
            {confirmBtnLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
