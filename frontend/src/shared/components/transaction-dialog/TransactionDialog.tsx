import React, { FunctionComponent, useState } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './TransactionDialog.module.scss';
import Input from '../input/Input';
import { useFlow } from '../../hooks/flow';
import { toast } from 'react-hot-toast';

const ConfirmDialog: FunctionComponent = () => {
    const [show, setShow] = useState<any>(true);
    const [code, setCode] = useState<any>('');
    const { sendTransaction } = useFlow();

    function onClose() {
        setShow(false);
    }

    async function onConfirm() {
        try {
            await sendTransaction(code);
        } catch (e: any) {
            toast.error(`Failed to send transaction: ${e.message}`);
        }
    }

    if (!show) {
        return null;
    }

    return (
        <Dialog onClose={onClose}>
            <div className={classes.root}>
                <h3>Send transaction</h3>
                <span>Send a transaction using dev-wallet. TODO: add better title & description</span>
                {/* TODO: replace with text area input */}
                <Input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
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
