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
import splitbee from '@splitbee/web';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Events: FunctionComponent<Props> = (props) => {
    const [openedLog, setOpenedLog] = useState('');
    const { formatDate } = useFormattedDate();
    const { searchTerm, setPlaceholder, disableSearchBar } = useSearch();
    const { data, firstFetch } = useTimeoutPolling(`/api/events/polling`, '_id');

    useEffect(() => {
        setPlaceholder('Search for block id, type, transaction ...');
        disableSearchBar(!data.length);
    }, [data]);

    const openLog = (status: boolean, id: string) => {
        setOpenedLog(!status ? id : '');
        splitbee.track('Events: toggle details');
    };

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item: any, i) => (
                    <React.Fragment key={i + '-' + item.blockId}>
                        <Card className={`${classes.card} ${item.isNew || item.isUpdated ? classes.isNew : ''}`}>
                            <div>
                                <Label>BLOCK ID</Label>
                                <Value>
                                    <NavLink to={`/blocks/details/${item.blockId}`}>
                                        <Ellipsis className={classes.hash}>{item.blockId}</Ellipsis>
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
                                <Label>TX ID</Label>
                                <Value>
                                    <NavLink to={`/transactions/details/${item.transactionId}`}>
                                        <Ellipsis className={classes.hash}>{item.transactionId}</Ellipsis>
                                    </NavLink>
                                </Value>
                            </div>
                            <div>
                                <Label title="TRANSACTION INDEX">TX INDEX</Label>
                                <Value>{item.transactionIndex}</Value>
                            </div>
                            <div>
                                <Label>EVENT INDEX</Label>
                                <Value>{item.eventIndex}</Value>
                            </div>
                            <div>
                                <CaretIcon
                                    inverted={true}
                                    isOpen={openedLog === item.id}
                                    className={classes.control}
                                    onChange={(status) => openLog(status, item.id)}
                                />
                            </div>
                        </Card>
                        {openedLog === item.id && (
                            <EventDetailsTable className={classes.detailsTable} data={item.data} />
                        )}
                    </React.Fragment>
                ))}
            {!firstFetch && <FullScreenLoading />}
            {firstFetch && filteredData.length === 0 && <NoResults className={classes.noResults} />}
        </>
    );
};

export default Events;
