import React, { FC, useEffect, useState } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './TransactionDialog.module.scss';
import { FlowScriptArgument, useFlow } from '../../hooks/flow';
import { toast } from 'react-hot-toast';
import { ReactComponent as TxIcon } from '../../assets/icons/bottle.svg';
import ScriptArguments from './ScriptArguments';
import CadenceEditor from '../cadence-editor/CadenceEditor';
import { NavLink } from 'react-router-dom';
import Ellipsis from '../ellipsis/Ellipsis';
import { isValueSet } from '../../functions/utils';
import splitbee from '@splitbee/web';

type Props = {
    show?: boolean;
    setShow: (value: boolean) => void;
};

const TransactionDialog: FC<Props> = ({ show, setShow }) => {
    const [code, setCode] = useState<any>('');
    const [args, setArgs] = useState<FlowScriptArgument[]>([]);
    const [loading, setLoading] = useState(false);
    const { sendTransaction } = useFlow();

    function onClose() {
        setShow(false);
        splitbee.track(`TransactionDialog: cancel`);
    }

    function validateArgs() {
        let valid = false;
        const unsetValues = args.filter((arg) => !isValueSet(arg.value));
        const unsetTypes = args.filter((arg) => !isValueSet(arg.type));

        if (unsetValues.length > 0) {
            toast.error('Some values are undefined!');
        }
        if (unsetTypes.length > 0) {
            toast.error('Some types are undefined!');
        }
        valid = unsetValues.length === 0 && unsetTypes.length === 0;
        return valid;
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
            splitbee.track(`TransactionDialog: send`);
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
