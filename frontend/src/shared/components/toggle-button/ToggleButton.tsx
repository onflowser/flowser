import React, { FunctionComponent, useEffect, useState } from 'react';
import classes from './ToggleButton.module.scss';

interface OwnProps {
    value?: boolean;
    onChange?: (state: boolean) => void;
}

type Props = OwnProps;

const ToggleButton: FunctionComponent<Props> = ({ value = false, onChange = () => false }) => {
    const [state, setState] = useState(false);
    useEffect(() => {
        setState(value);
    }, [value]);

    useEffect(() => {
        onChange(state);
    }, [state]);

    const onToggle = () => {
        setState(!state);
    };

    return (
        <div className={classes.root}>
            <div onClick={onToggle}>
                <span className={`${state ? classes.active : classes.inactive}`}></span>
            </div>
        </div>
    );
};

export default ToggleButton;
