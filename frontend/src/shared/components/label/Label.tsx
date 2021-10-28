import React, { FunctionComponent } from 'react';
import classes from './Label.module.scss';

interface LabelProps {
    children: any;
    className?: any;
    variant?: 'small' | 'normal' | 'medium' | 'large' | 'xlarge';
    title?: string;
}

type Props = LabelProps;

const Label: FunctionComponent<Props> = ({ children, className, variant = 'normal', title = '' }) => {
    return (
        <span className={`${classes.root} ${classes[variant]} ${className}`} title={title}>
            {children}
        </span>
    );
};

export default Label;
