import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ReactComponent as CaretIconSvg } from '../../assets/icons/caret.svg';
import classes from './CaretIcon.module.scss';

interface OwnProps {
    isOpen?: boolean;
    onChange?: (isOpen: boolean) => void;
}

type Props = OwnProps;

const CaretIcon: FunctionComponent<Props> = ({ isOpen = false, onChange = () => false }) => {
    const [state, setState] = useState(isOpen);

    useEffect(() => {
        setState(isOpen);
    }, [isOpen]);

    const onToggle = useCallback(() => {
        setState((state) => !!state);
        onChange(state);
    }, [isOpen]);

    return <CaretIconSvg className={`${classes.root} ${state ? classes.isOpen : ''}`} onClick={onToggle} />;
};

export default CaretIcon;
