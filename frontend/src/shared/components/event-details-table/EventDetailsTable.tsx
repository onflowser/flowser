import React, { FunctionComponent } from 'react';
import classes from './EventDetailsTable.module.scss';
import Ellipsis from '../ellipsis/Ellipsis';
import CopyButton from '../copy-button/CopyButton';

interface EventDetail {
    name: string;
    type: string;
    value: string;

    [key: string]: any;
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
                        <div>
                            <Ellipsis className={classes.ellipsis}>{item.name}</Ellipsis>
                        </div>
                        <div>
                            <Ellipsis className={classes.ellipsis}>{item.type}</Ellipsis>
                        </div>
                        <div>
                            <Ellipsis className={classes.ellipsis}>{item.value}</Ellipsis>
                            <CopyButton value={item.value} />
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default EventDetailsTable;
