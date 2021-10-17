import React, { FunctionComponent } from 'react';
import classes from './Input.module.scss';

interface OwnProps {
    type?: string;
    value?: any;
    onChange?: () => void;
}

type Props = OwnProps;

const Input: FunctionComponent<Props> = ({ type = 'text', value = '', onChange = () => false }) => {
    return (
        <div className={classes.root}>
            <input type={type} value={value} onChange={onChange} />
        </div>
    );
};

export default Input;
