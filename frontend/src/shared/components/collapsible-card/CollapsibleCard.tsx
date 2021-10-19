import React, { FunctionComponent, useCallback, useState } from 'react';
import Card from '../card/Card';
import classes from './Collapsible.module.scss';
import CaretIcon from '../caret-icon/CaretIcon';

interface OwnProps {
    children: any;
    header: string;
    subheader?: string;
    variant?: 'blue' | 'black';
    isNew?: boolean;
    [key: string]: any;
}

type Props = OwnProps;

const CollapsibleCard: FunctionComponent<Props> = ({ children, variant, header, subheader, isNew, ...restProps }) => {
    const [state, setState] = useState(false);

    const onToggle = useCallback(() => {
        setState((state) => !state);
    }, []);

    return (
        <Card variant={variant} className={`${classes.root} ${restProps.className} ${isNew && classes.isNew}`}>
            <div className={`${classes.header} ${state ? classes.expanded : ''}`}>
                <div className={classes.title}>
                    <span>{header}</span>
                    {subheader && <span onClick={onToggle}>{subheader}</span>}
                </div>
                <CaretIcon className={classes.icon} isOpen={state} onChange={onToggle} />
            </div>
            <div className={`${classes.content} ${state ? classes.expanded : ''}`}>{children}</div>
        </Card>
    );
};

export default CollapsibleCard;
