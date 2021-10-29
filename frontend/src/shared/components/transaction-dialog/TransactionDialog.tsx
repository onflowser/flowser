import React, { FunctionComponent, useState } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './TransactionDialog.module.scss';
import Input from '../input/Input';
import { useFlow } from '../../hooks/flow';
import { toast } from 'react-hot-toast';
import { ReactComponent as TxIcon } from '../../assets/icons/flow.svg';
import TextArea from '../text-area/TextArea'; // TODO: replace with "bottle" icon

const ConfirmDialog: FunctionComponent = () => {
    const [show, setShow] = useState<any>(true);
    const [code, setCode] = useState<any>('');
    const { sendTransaction } = useFlow();

    function onClose() {
        setShow(false);
    }

    async function onConfirm() {
        try {
            const result = await sendTransaction(code);
            console.log({ result });
            toast('Transaction sent!');
        } catch (e: any) {
            toast.error(e.message ? `Failed to send transaction: ${e.message}` : e);
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
                <TextArea rows={10} placeholder="Cadence code" value={code} onChange={(e) => setCode(e.target.value)} />
                <div className={classes.actions}>
                    <Button outlined={true} variant="middle" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="middle" onClick={onConfirm}>
                        Send
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmDialog;
