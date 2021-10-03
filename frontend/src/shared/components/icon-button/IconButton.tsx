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
    return (
        <Button {...restProps} className={`${classes.root} ${restProps.className}`}>
            {iconPosition === 'before' ? (
                <>
                    {icon} {restProps.children}
                </>
            ) : (
                <>
                    {restProps.children} {icon}
                </>
            )}
        </Button>
    );
};

export default IconButton;
