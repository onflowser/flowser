import React, { FunctionComponent, useState } from "react";
import Button from "../button/Button";
import { ActionDialog, ActionDialogProps } from "../action-dialog/ActionDialog";

export type ConfirmDialogProps = ActionDialogProps & {
  onClose: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
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
  const [isLoading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  }

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
          <Button loading={isLoading} variant="middle" onClick={handleConfirm}>
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
