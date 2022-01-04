import React, { FunctionComponent } from 'react';
import Dialog from '../dialog/Dialog';
import Button from '../button/Button';
import classes from './ConfirmDialog.module.scss';

interface OwnProps {
    onClose: () => void;
    onConfirm: (event: any) => void;
    confirmBtnLabel?: string;
    cancelBtnLabel?: string;
    className?: string;
    children?: JSX.Element[] | JSX.Element | undefined;
}

type Props = OwnProps;

const ConfirmDialog: FunctionComponent<Props> = ({
    onConfirm,
    onClose,
    confirmBtnLabel = 'OK',
    cancelBtnLabel = 'CANCEL',
    children,
    className = '',
}) => {
    return (
        <Dialog className={className} onClose={onClose}>
            <div className={classes.root}>
                {children}
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
