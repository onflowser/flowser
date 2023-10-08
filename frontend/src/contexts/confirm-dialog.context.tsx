import React, {
  createContext,
  ReactElement,
  useContext,
  useState,
} from "react";
import { ConfirmationDialog } from "../../../packages/ui/src/common/overlays/dialogs/confirmation/ConfirmationDialog";

export type ConfirmDialogContextState = {
  showDialog: (props: OpenConfirmDialogProps) => void;
  hideDialog: () => void;
};

export type OpenConfirmDialogProps = {
  confirmButtonLabel: string;
  cancelButtonLabel: string;
  title: string;
  body: ReactElement;
  onConfirm?: () => void | Promise<void>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextState>({
  showDialog: () => undefined,
  hideDialog: () => undefined,
});

export function useConfirmDialog(): ConfirmDialogContextState {
  return useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const [dialogProps, setDialogProps] = useState<
    OpenConfirmDialogProps | undefined
  >();
  const isShowingDialog = dialogProps !== undefined;
  const defaultOnConfirm = () => {
    hideDialog();
  };

  function showDialog(props: OpenConfirmDialogProps) {
    setDialogProps(props);
  }

  function hideDialog() {
    setDialogProps(undefined);
  }

  return (
    <ConfirmDialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {isShowingDialog && (
        <ConfirmationDialog
          onClose={hideDialog}
          title={dialogProps.title}
          onConfirm={dialogProps.onConfirm ?? defaultOnConfirm}
          confirmButtonLabel={dialogProps.confirmButtonLabel}
          cancelButtonLabel={dialogProps.cancelButtonLabel}
        >
          {dialogProps.body}
        </ConfirmationDialog>
      )}
    </ConfirmDialogContext.Provider>
  );
}
