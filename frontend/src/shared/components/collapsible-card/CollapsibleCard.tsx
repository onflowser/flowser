import React, { FunctionComponent, useCallback, useState } from 'react';
import Card from '../card/Card';
import classes from './Collapsible.module.scss';
import { ReactComponent as CollapseIcon } from '../../assets/icons/open-logs.svg';

interface OwnProps {
    children: any;
    header: string;
    variant?: 'blue' | 'black';

    [key: string]: any;
}

type Props = OwnProps;

const CollapsibleCard: FunctionComponent<Props> = ({ children, variant, header, ...restProps }) => {
    const [state, setState] = useState(false);

    const onToggle = useCallback(() => {
        setState((state) => !state);
    }, []);

    return (
        <Card variant={variant} className={`${classes.root} ${restProps.className}`}>
            <div className={`${classes.header} ${state ? classes.expanded : ''}`}>
                <span>{header}</span>
                <CollapseIcon className={`${classes.icon} ${!state ? classes.expanded : ''}`} onClick={onToggle} />
            </div>
            <div className={`${classes.content} ${state ? classes.expanded : ''}`}>{children}</div>
        </Card>
    );
};

export default CollapsibleCard;
