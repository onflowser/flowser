import React, { FunctionComponent, MouseEventHandler } from 'react';
import Card from '../card/Card';
import Label from '../label/Label';
import Value from '../value/Value';
import classes from './DetailsItem.module.scss';
import { ReactComponent as OpenIcon } from '../../assets/icons/open.svg';

type Props = {
    label: string;
    value: string | number;
    open?: boolean;
    onClick?: MouseEventHandler<HTMLDivElement> | undefined;
};

const DetailsItem: FunctionComponent<Props> = ({ label, value, onClick, open }) => (
    <Card className={`${classes.container} ${onClick && classes.container__clickable}`} onClick={onClick}>
        <Label>{label}</Label>
        <Value>{value}</Value>
        {onClick && (
            <div className={classes.icon}>
                {/* TODO: add close icon */}
                {open ? <OpenIcon /> : <OpenIcon />}
            </div>
        )}
    </Card>
);

export default DetailsItem;
