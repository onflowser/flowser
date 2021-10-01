import React, { FunctionComponent } from 'react';
import classes from './Button.module.scss';

interface OwnProps {
    onClick?: () => void;
    variant?: 'big' | 'normal';
    disabled?: boolean;
}

type Props = OwnProps;

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
            className={`${classes.button} ${classes[variant]} ${disabled ? classes.disabled : ''}`}
        >
            {restProps.children}
        </button>
    );
};

export default Button;
