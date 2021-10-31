import React, { FunctionComponent } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './ConfirmDialog.module.scss';

interface OwnProps {
    onClose: () => void;
    onConfirm: (event: any) => void;
    title: string;
    text: string;
    confirmBtnLabel?: string;
    cancelBtnLabel?: string;
}

type Props = OwnProps;

const ConfirmDialog: FunctionComponent<Props> = ({
    onConfirm,
    onClose,
    title,
    text,
    confirmBtnLabel = 'OK',
    cancelBtnLabel = 'CANCEL',
}) => {
    return (
        <Dialog onClose={onClose}>
            <div className={classes.root}>
                <h3>{title}</h3>
                <span>{text}</span>
                <div className={classes.actions}>
                    <Button outlined={true} variant="middle" onClick={onClose}>
                        {cancelBtnLabel}
                    </Button>
                    <Button variant="middle" onClick={onConfirm}>
                        {confirmBtnLabel}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmDialog;
