import React, { FunctionComponent } from 'react';
import classes from './Value.module.scss';

interface ValueProps {
    children: any;
    className?: any;
}

type Props = ValueProps;

const Value: FunctionComponent<Props> = ({ children, className }) => {
    return <span className={`${classes.root} ${className}`}>{children}</span>;
};

export default Value;
