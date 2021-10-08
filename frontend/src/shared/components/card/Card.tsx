import React, { FunctionComponent } from 'react';
import classes from './Card.module.scss';

interface OwnProps {
    children?: any;
    className?: any;
    variant?: 'blue' | 'black';
    active?: boolean;
    [key: string]: any;
}

type Props = OwnProps;

const Card: FunctionComponent<Props> = ({ children, className, variant = 'blue', active = false, ...restProps }) => {
    return (
        <div
            className={`${classes.root} ${classes[variant]} ${active ? classes.active : ''} ${className}`}
            {...restProps}
        >
            {children}
        </div>
    );
};

export default Card;
