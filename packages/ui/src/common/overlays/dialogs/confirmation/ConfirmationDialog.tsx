import React, { FunctionComponent, ReactElement, useState } from "react";
import Button from "../../../buttons/Button/Button";
import { ActionDialog } from "../action/ActionDialog";

export type ConfirmDialogProps = {
  onCancel: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  className?: string;
  title: string;
  children: ReactElement[] | ReactElement;
};

export const ConfirmationDialog: FunctionComponent<ConfirmDialogProps> = ({
  onConfirm,
  onCancel,
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
      onCancel();
    }
  }

  return (
    <ActionDialog
      title={title}
      className={className}
      onClose={onCancel}
      footer={
        <>
          <Button outlined={true} variant="middle" onClick={onCancel}>
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
