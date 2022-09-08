import React, { FunctionComponent, MouseEventHandler } from "react";
import Button from "../button/Button";
import { ActionDialog, ActionDialogProps } from "../action-dialog/ActionDialog";

type ConfirmDialogProps = ActionDialogProps & {
  onClose: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onConfirm: MouseEventHandler<HTMLButtonElement> | undefined;
  confirmBtnLabel?: string;
  cancelBtnLabel?: string;
  className?: string;
  title: string;
};

const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = ({
  onConfirm,
  onClose,
  title,
  confirmBtnLabel = "OK",
  cancelBtnLabel = "CANCEL",
  children,
  className = "",
}) => {
  return (
    <ActionDialog
      title={title}
      className={className}
      onClose={onClose}
      footer={
        <>
          <Button outlined={true} variant="middle" onClick={onClose}>
            {cancelBtnLabel}
          </Button>
          <Button variant="middle" onClick={onConfirm}>
            {confirmBtnLabel}
          </Button>
        </>
      }
    >
      {children}
    </ActionDialog>
  );
};

export default ConfirmDialog;
