import React, { FunctionComponent } from 'react';
import classes from './Button.module.scss';

export interface ButtonProps {
    onClick?: () => void;
    variant?: 'big' | 'middle' | 'normal';
    disabled?: boolean;
    outlined?: boolean;
    [key: string]: any;
}

type Props = ButtonProps;

const Button: FunctionComponent<Props> = ({
    onClick = () => true,
    disabled = false,
    variant = 'normal',
    outlined = false,
    ...restProps
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            {...restProps}
            className={`${classes.button} ${classes[variant]} ${disabled ? classes.disabled : ''} ${
                restProps.className
            } ${outlined ? classes.outlined : ''}`}
        >
            {restProps.children}
        </button>
    );
};

export default Button;
