import React, { FC, useEffect, useState } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './TransactionDialog.module.scss';
import { useFlow } from '../../hooks/flow';
import { toast } from 'react-hot-toast';
import { ReactComponent as TxIcon } from '../../assets/icons/bottle.svg';
import ScriptArguments from './ScriptArguments';
import CadenceEditor from '../cadence-editor/CadenceEditor';
import { NavLink } from 'react-router-dom';
import Ellipsis from '../ellipsis/Ellipsis';

type Props = {
    show?: boolean;
    setShow: (value: boolean) => void;
};

const TransactionDialog: FC<Props> = ({ show, setShow }) => {
    const [code, setCode] = useState<any>('');
    const [args, setArgs] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const { sendTransaction } = useFlow();

    function onClose() {
        setShow(false);
    }

    async function onConfirm() {
        setLoading(true);
        try {
            // edge case: if dev-wallet can't retrieve accounts
            // e.g. emulator access node is not running
            // it will dim the screen, but not open the modal window
            // so the user will be stuck on this intermediate state
            const { transactionId } = await sendTransaction(code, args);
            setShow(false);
            toast(
                (t) => (
                    <span className={classes.toast}>
                        Transaction {` `}
                        <NavLink to={`/transactions/details/${transactionId}`}>
                            <Ellipsis className={classes.transactionId}>{transactionId}</Ellipsis>
                        </NavLink>
                        {` `}sent!
                    </span>
                ),
                { duration: 100000 },
            );
        } catch (e: any) {
            toast.error(e.message ? `Failed to send transaction: ${e.message}` : e, { duration: 5000 });
        } finally {
            setLoading(false);
        }
    }

    if (!show) {
        return null;
    }

    return (
        <Dialog className={classes.dialog} onClose={onClose}>
            <div className={classes.root}>
                <TxIcon className={classes.icon} />
                <h3>SEND A TRANSACTION</h3>
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
