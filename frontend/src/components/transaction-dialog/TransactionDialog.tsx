import React, { FC, useState } from "react";
import Dialog from "../dialog/Dialog";
import Button from "../button/Button";
import classes from "./TransactionDialog.module.scss";
import { FlowScriptArgument, useFlow } from "../../hooks/use-flow";
import { toast } from "react-hot-toast";
import { ReactComponent as TxIcon } from "../../assets/icons/bottle.svg";
import ScriptArguments from "./ScriptArguments";
import CadenceEditor from "../cadence-editor/CadenceEditor";
import { NavLink } from "react-router-dom";
import Ellipsis from "../ellipsis/Ellipsis";
import { CommonUtils } from "../../utils/common-utils";
import splitbee from "@splitbee/web";
import { useSyntaxHighlighter } from "../../hooks/use-syntax-highlighter";

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
  const { highlightCadenceSyntax } = useSyntaxHighlighter();
  const highlightedError = highlightCadenceSyntax(longError);

  function onClose() {
    setShow(false);
    splitbee.track(`TransactionDialog: cancel`);
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
              <Ellipsis className={classes.transactionId}>
                {transactionId}
              </Ellipsis>
            </NavLink>
            {` `}sent!
          </span>
        ),
        { duration: 100000 }
      );
      splitbee.track(`TransactionDialog: send`);
    } catch (e: any) {
      if (e.message) {
        toast.error(e.message, { duration: 5000 });
      } else {
        toast.error("Transaction error");
        // error is too long to be shown in a toaster
        setLongError(e);
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
          <pre
            style={{ height: 500, overflow: "scroll" }}
            dangerouslySetInnerHTML={{
              __html: highlightedError.replaceAll("\\n", "<br/>"),
            }}
          />
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
    <Dialog className={classes.dialog} onClose={onClose}>
      <div className={classes.root}>
        <TxIcon className={classes.icon} />
        <h3>SEND A TRANSACTION</h3>
        {longError && (
          <button
            className={classes.errorButton}
            onClick={() => setShowLongError(true)}
          >
            Transaction error occurred, click to view!
          </button>
        )}
        <CadenceEditor value={code} onChange={setCode} />
        <ScriptArguments className={classes.arguments} onChange={setArgs} />
        <div className={classes.actions}>
          <Button outlined={true} variant="middle" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} variant="middle" onClick={onConfirm}>
            Send
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default TransactionDialog;
