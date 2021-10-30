import React, { FunctionComponent, useState } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './TransactionDialog.module.scss';
import { useFlow } from '../../hooks/flow';
import { toast } from 'react-hot-toast';
import { ReactComponent as TxIcon } from '../../assets/icons/bottle.svg';
import TextArea from '../text-area/TextArea';
import ScriptArguments from './ScriptArguments'; // TODO: replace with "bottle" icon

const ConfirmDialog: FunctionComponent = () => {
    const [show, setShow] = useState<any>(true);
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
            const result = await sendTransaction(code, args);
            console.log({ result });
            toast('Transaction sent!');
        } catch (e: any) {
            toast.error(e.message ? `Failed to send transaction: ${e.message}` : e);
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
                <TextArea rows={10} placeholder="Cadence code" value={code} onChange={(e) => setCode(e.target.value)} />
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

export default ConfirmDialog;
