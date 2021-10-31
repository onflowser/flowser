import React, { FunctionComponent } from 'react';
import classes from './Input.module.scss';

interface OwnProps {
    type?: string;
    value?: any;
    disabled?: boolean;
    onChange?: (e: any) => void;
    [key: string]: any;
}

type Props = OwnProps;

const Input: FunctionComponent<Props> = ({
    type = 'text',
    value = '',
    disabled = false,
    onChange = () => false,
    ...restProps
}) => {
    return (
        <div className={classes.root}>
            <input disabled={disabled} type={type} value={value} onChange={onChange} {...restProps} />
        </div>
    );
};

export default Input;
