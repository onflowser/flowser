import React, { FunctionComponent } from 'react';
import classes from './Button.module.scss';

export interface ButtonProps {
    onClick?: () => void;
    variant?: 'big' | 'normal';
    disabled?: boolean;
    [key: string]: any;
}

type Props = ButtonProps;

const Button: FunctionComponent<Props> = ({
    onClick = () => true,
    disabled = false,
    variant = 'normal',
    ...restProps
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${classes.button} ${classes[variant]} ${disabled ? classes.disabled : ''} ${
                restProps.className
            }`}
        >
            {restProps.children}
        </button>
    );
};

export default Button;
