import React, { FunctionComponent } from 'react';
import classes from './Badge.module.scss';

const Badge: FunctionComponent<any> = ({ className, children }) => {
    return <span className={`${classes.root} ${className}`}>{children}</span>;
};

export default Badge;
