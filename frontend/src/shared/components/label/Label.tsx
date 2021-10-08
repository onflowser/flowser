import React, { FunctionComponent } from 'react';
import classes from './Label.module.scss';

interface LabelProps {
    children: any;
    className?: any;
    variant?: 'small' | 'normal' | 'medium' | 'large';
}

type Props = LabelProps;

const Label: FunctionComponent<Props> = ({ children, className, variant = 'normal' }) => {
    return <span className={`${classes.root} ${classes[variant]} ${className}`}>{children}</span>;
};

export default Label;
