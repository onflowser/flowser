import React, { FunctionComponent } from 'react';
import classes from './Value.module.scss';

interface ValueProps {
    children: any;
    className?: any;
    variant?: 'small' | 'normal' | 'medium' | 'large';
}

type Props = ValueProps;

const Value: FunctionComponent<Props> = ({ children, className, variant = 'normal' }) => {
    return <span className={`${classes.root} ${classes[variant]} ${className}`}>{children}</span>;
};

export default Value;
