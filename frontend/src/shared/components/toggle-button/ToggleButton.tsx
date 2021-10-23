import React, { FunctionComponent, useEffect, useState } from 'react';
import classes from './ToggleButton.module.scss';

interface OwnProps {
    value?: boolean;
    onChange?: (state: boolean) => void;
}

type Props = OwnProps;

const ToggleButton: FunctionComponent<Props> = ({ value = false, onChange = () => false }) => {
    return (
        <div className={classes.root}>
            <div onClick={() => onChange(!value)}>
                <span className={`${value ? classes.active : classes.inactive}`} />
            </div>
        </div>
    );
};

export default ToggleButton;
