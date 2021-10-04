import React, { FunctionComponent } from 'react';
import classes from './Card.module.scss';

interface OwnProps {
    children: any;
    className?: any;
    [key: string]: any;
}

type Props = OwnProps;

const Card: FunctionComponent<Props> = ({ children, className, ...restProps }) => {
    return (
        <div className={`${classes.root} ${className}`} {...restProps}>
            {children}
        </div>
    );
};

export default Card;
