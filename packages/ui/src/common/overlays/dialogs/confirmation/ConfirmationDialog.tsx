import React, { FunctionComponent, useState } from "react";
import Button from "../../../buttons/Button/Button";
import { ActionDialog, ActionDialogProps } from "../action/ActionDialog";

export type ConfirmDialogProps = ActionDialogProps & {
  onClose: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  className?: string;
  title: string;
};

export const ConfirmationDialog: FunctionComponent<ConfirmDialogProps> = ({
  onConfirm,
  onClose,
  title,
  confirmButtonLabel = "OK",
  cancelButtonLabel = "CANCEL",
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
            {cancelButtonLabel}
          </Button>
          <Button loading={isLoading} variant="middle" onClick={handleConfirm}>
            {confirmButtonLabel}
          </Button>
        </>
      }
    >
      {children}
    </ActionDialog>
  );
};
