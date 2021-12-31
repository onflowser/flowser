import React, { FunctionComponent } from 'react';
import classes from './Dialog.module.scss';
import Card from '../card/Card';

interface OwnProps {
    children: any;
    onClose: () => void;
    className?: string;
    [key: string]: any;
}

type Props = OwnProps;

const Dialog: FunctionComponent<Props> = ({ children, onClose, className = '', ...restProps }) => {
    const onOutsideClick = (event: any) => {
        event.stopPropagation();
        onClose();
    };

    const onClickInside = (event: any) => {
        event.stopPropagation();
    };

    return (
        <div className={`${classes.root} ${className}`} onClick={onOutsideClick}>
            <div className={`${classes.dialog} ${restProps.className}`}>
                <Card className={classes.card} onClick={onClickInside}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export default Dialog;
