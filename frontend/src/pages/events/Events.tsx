import React, { FunctionComponent, useEffect, useState } from 'react';
import classes from './Events.module.scss';
import Card from '../../shared/components/card/Card';
import Label from '../../shared/components/label/Label';
import Value from '../../shared/components/value/Value';
import { NavLink } from 'react-router-dom';
import Ellipsis from '../../shared/components/ellipsis/Ellipsis';
import { useFilterData } from '../../shared/hooks/filter-data';
import { useFormattedDate } from '../../shared/hooks/formatted-date';
import { useSearch } from '../../shared/hooks/search';
import CaretIcon from '../../shared/components/caret-icon/CaretIcon';
import EventDetailsTable from '../../shared/components/event-details-table/EventDetailsTable';
import { useTimeoutPolling } from '../../shared/hooks/timeout-polling';
import NoResults from '../../shared/components/no-results/NoResults';
import FullScreenLoading from '../../shared/components/fullscreen-loading/FullScreenLoading';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Events: FunctionComponent<Props> = (props) => {
    const [openedLog, setOpenedLog] = useState('');
    const { formatDate } = useFormattedDate();
    const { searchTerm, setPlaceholder } = useSearch();
    const { data, isFetching } = useTimeoutPolling(`/api/events/polling`);
    const [firstFetch, setFirstFetch] = useState(false);

    useEffect(() => {
        if (!isFetching && !firstFetch) {
            setFirstFetch(true);
        }
    }, [isFetching]);

    useEffect(() => {
        setPlaceholder('Search for block id, type, transaction ...');
    }, []);

    const openLog = (status: boolean, id: string) => {
        setOpenedLog(!status ? id : '');
    };

    // TODO: what will be displayed in event details table ? (event.data?)
    const eventDetails = [
        { name: 'amount', type: 'VFI64', value: '0.001' },
        { name: 'from', type: 'VFI64', value: '0.002' },
    ];

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item: any, i) => (
                    <React.Fragment key={i}>
                        <Card className={`${classes.card} ${i + 1 === filteredData.length ? classes.isNew : ''}`}>
                            <div>
                                <Label>BLOCK ID</Label>
                                <Value>
                                    <NavLink to={`/blocks/details/${item._id}`}>
                                        <Ellipsis className={classes.hash}>{item._id}</Ellipsis>
                                    </NavLink>
                                </Value>
                            </div>
                            <div>
                                <Label>TIMESTAMP</Label>
                                <Value>{formatDate(new Date(item.createdAt).toISOString())}</Value>
                            </div>
                            <div>
                                <Label>TYPE</Label>
                                <Value>{item.type}</Value>
                            </div>
                            <div>
                                <Label>TRANSACTION ID</Label>
                                <Value>
                                    <NavLink to={`/transactions/details/${item.transactionId}`}>
                                        <Ellipsis className={classes.hash}>{item.transactionId}</Ellipsis>
                                    </NavLink>
                                </Value>
                            </div>
                            <div>
                                <Label>TRANSACTION INDEX</Label>
                                <Value>{item.transactionIndex}</Value>
                            </div>
                            <div>
                                <Label>EVENT INDEX</Label>
                                <Value>{item.eventIndex}</Value>
                            </div>
                            <div>
                                <CaretIcon
                                    inverted={true}
                                    isOpen={openedLog === item._id}
                                    className={classes.control}
                                    onChange={(status) => openLog(status, item._id)}
                                />
                            </div>
                        </Card>
                        {openedLog === item._id && (
                            <EventDetailsTable className={classes.detailsTable} items={eventDetails} />
                        )}
                    </React.Fragment>
                ))}
            {!firstFetch && <FullScreenLoading />}
            {firstFetch && filteredData.length === 0 && <NoResults className={classes.noResults} />}
        </>
    );
};

export default Events;
