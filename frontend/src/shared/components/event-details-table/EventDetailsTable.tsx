import React, { FunctionComponent } from 'react';
import classes from './EventDetailsTable.module.scss';

interface EventDetail {
    name: string;
    type: string;
    value: string;
}

interface OwnProps {
    items: EventDetail[];
    [key: string]: any;
}

type Props = OwnProps;

const EventDetailsTable: FunctionComponent<Props> = ({ items, ...restProps }) => {
    return (
        <div className={`${classes.root} ${restProps.className}`}>
            <div className={classes.header}>
                <div>VALUES</div>
                <div>NAME</div>
                <div>TYPE</div>
                <div>VALUE</div>
            </div>
            {items.length &&
                items.map((item, index) => (
                    <div key={index} className={classes.row}>
                        <div></div>
                        <div>{item.name}</div>
                        <div>{item.type}</div>
                        <div>{item.value}</div>
                    </div>
                ))}
        </div>
    );
};

export default EventDetailsTable;
