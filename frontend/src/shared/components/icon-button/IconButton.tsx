import React, { FunctionComponent } from 'react';
import Button, { ButtonProps } from '../button/Button';
import classes from './IconButton.module.scss';

interface IconButtonProps extends ButtonProps {
    icon: React.Component | any;
    iconPosition?: 'before' | 'after';
    [key: string]: any;
}

type Props = IconButtonProps;

const IconButton: FunctionComponent<Props> = ({ icon, iconPosition = 'before', ...restProps }) => {
    let children = icon;
    if (restProps.children) {
        if (iconPosition === 'before') {
            children = (
                <span className={classes.before}>
                    {icon} {restProps.children}
                </span>
            );
        } else {
            children = (
                <span className={classes.after}>
                    {restProps.children} {icon}
                </span>
            );
        }
    }
    return (
        <Button {...restProps} className={`${restProps.className}`}>
            {children}
        </Button>
    );
};

export default IconButton;
