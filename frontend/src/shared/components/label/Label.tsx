import React, { FunctionComponent } from 'react';
import classes from './Label.module.scss';

interface LabelProps {
    children: any;
    className?: any;
}

type Props = LabelProps;

const Label: FunctionComponent<Props> = ({ children, className }) => {
    return <span className={`${classes.root} ${className}`}>{children}</span>;
};

export default Label;
