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
    const { data, firstFetch } = useTimeoutPolling(`/api/events/polling`);

    useEffect(() => {
        setPlaceholder('Search for block id, type, transaction ...');
    }, []);

    const openLog = (status: boolean, id: string) => {
        setOpenedLog(!status ? id : '');
    };

    function getType(value: any) {
        switch (true) {
            case typeof value === 'number':
                return 'Number';
            case typeof value === 'string':
                return 'String';
            case value instanceof Array:
                return 'Array';
            case value instanceof Object:
                return 'Object';
            case value === null:
                return 'NULL';
            default:
                return 'unknown';
        }
    }

    function formatEventData(data: { [key: string]: any }) {
        const keys = Object.keys(data);
        return keys.map((key) => {
            const item = data[key];
            return {
                name: key,
                type: getType(item),
                value: `${item}`,
            };
        });
    }

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
                                    isOpen={openedLog === item.id}
                                    className={classes.control}
                                    onChange={(status) => openLog(status, item.id)}
                                />
                            </div>
                        </Card>
                        {openedLog === item.id && (
                            <EventDetailsTable className={classes.detailsTable} items={formatEventData(item.data)} />
                        )}
                    </React.Fragment>
                ))}
            {!firstFetch && <FullScreenLoading />}
            {firstFetch && filteredData.length === 0 && <NoResults className={classes.noResults} />}
        </>
    );
};

export default Events;
