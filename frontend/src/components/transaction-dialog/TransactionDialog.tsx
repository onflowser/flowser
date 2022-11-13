import React, { FC, useState } from "react";
import Dialog from "../dialog/Dialog";
import Button from "../button/Button";
import classes from "./TransactionDialog.module.scss";
import { FlowScriptArgument, useFlow } from "../../hooks/use-flow";
import { toast } from "react-hot-toast";
import ScriptArguments from "./ScriptArguments";
import { CadenceEditor } from "../cadence-editor/CadenceEditor";
import { NavLink } from "react-router-dom";
import MiddleEllipsis from "../ellipsis/MiddleEllipsis";
import { CommonUtils } from "../../utils/common-utils";
import { ActionDialog } from "../action-dialog/ActionDialog";
import { TransactionErrorMessage } from "../status/ErrorMessage";
import { useErrorHandler } from "../../hooks/use-error-handler";

export type TransactionDialogProps = {
  show?: boolean;
  setShow: (value: boolean) => void;
};

const TransactionDialog: FC<TransactionDialogProps> = ({ show, setShow }) => {
  const [code, setCode] = useState<string>("");
  const [showLongError, setShowLongError] = useState<boolean>(false);
  const [longError, setLongError] = useState<string>("");
  const [args, setArgs] = useState<FlowScriptArgument[]>([]);
  const [loading, setLoading] = useState(false);
  const { sendTransaction } = useFlow();
  const { handleError } = useErrorHandler(TransactionDialog.name);

  function onClose() {
    setCode("");
    setShowLongError(false);
    setLongError("");
    setArgs([]);
    setShow(false);
  }

  function validateArgs() {
    const unsetValues = args.filter(
      (arg) => !CommonUtils.isNotEmpty(arg.value)
    );
    const unsetTypes = args.filter((arg) => !CommonUtils.isNotEmpty(arg.type));

    if (unsetValues.length > 0) {
      toast.error("Some values are undefined!");
    }
    if (unsetTypes.length > 0) {
      toast.error("Some shared are undefined!");
    }
    const isValid = unsetValues.length === 0 && unsetTypes.length === 0;
    return isValid;
  }

  async function onConfirm() {
    setLoading(true);
    try {
      if (!validateArgs()) {
        return;
      }
      // edge case: if dev-wallet can't retrieve accounts
      // e.g. emulator access node is not running
      // it will dim the screen, but not open the modal window
      // so the user will be stuck on this intermediate state
      const { transactionId } = await sendTransaction(code, args);
      setShow(false);
      toast(
        () => (
          <span className={classes.toast}>
            Transaction {` `}
            <NavLink to={`/transactions/details/${transactionId}`}>
              <MiddleEllipsis className={classes.transactionId}>
                {transactionId}
              </MiddleEllipsis>
            </NavLink>
            {` `}sent!
          </span>
        ),
        { duration: 4000 }
      );
    } catch (error: unknown) {
      const cadenceError =
        typeof error === "string"
          ? error
          : CommonUtils.isStandardError(error)
          ? error.message
          : undefined;
      // error is too long to be shown in a toaster
      const isLongCadenceError = cadenceError && cadenceError.length > 100;
      if (isLongCadenceError) {
        toast.error("Transaction error");
        setLongError(cadenceError);
      } else {
        handleError(error);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!show) {
    return null;
  }

  if (showLongError) {
    return (
      <Dialog className={classes.dialog} onClose={onClose}>
        <div className={classes.root} style={{ padding: 0 }}>
          <TransactionErrorMessage errorMessage={longError} />
          <div className={classes.actions}>
            <Button
              loading={loading}
              variant="middle"
              onClick={() => setShowLongError(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <ActionDialog
      className={classes.dialog}
      bodyClass={classes.root}
      title="Send a transaction"
      onClose={onClose}
      footer={
        <>
          {" "}
          <Button outlined={true} variant="middle" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} variant="middle" onClick={onConfirm}>
            Send
          </Button>
        </>
      }
    >
      <>
        {longError && (
          <button
            className={classes.errorButton}
            onClick={() => setShowLongError(true)}
          >
            Transaction error occurred, click to view!
          </button>
        )}
        <CadenceEditor
          value={code}
          onChange={setCode}
          minHeight="200px"
          maxHeight="300px"
        />
        <ScriptArguments className={classes.arguments} onChange={setArgs} />
      </>
    </ActionDialog>
  );
};

export default TransactionDialog;
