import React, { FunctionComponent } from 'react';
import classes from './EventDetailsTable.module.scss';
import Ellipsis from '../ellipsis/Ellipsis';
import CopyButton from '../copy-button/CopyButton';
import { formatEventData } from '../../functions/events';

export interface EventData {
    [key: string]: any;
}

interface OwnProps {
    data: EventData;
    [key: string]: any;
}

type Props = OwnProps;

const EventDetailsTable: FunctionComponent<Props> = ({ data, ...restProps }) => {
    const items = formatEventData(data);
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
