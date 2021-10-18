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

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Events: FunctionComponent<Props> = (props) => {
    const [openedLog, setOpenedLog] = useState('');
    const { formatDate } = useFormattedDate();
    const { searchTerm, setPlaceholder } = useSearch();

    useEffect(() => {
        setPlaceholder('Search for block id, type, transaction ...');
    }, []);

    const openLog = (status: boolean, id: string) => {
        setOpenedLog(!status ? id : '');
    };

    const data = [
        {
            createdAt: 1633711711619,
            _id: 'd7f877cadda18a52d2bb36cd5458dc4fd9d1f7ce5316eb1db66269a6ccc25ed1:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: 'd7f877cadda18a52d2bb36cd5458dc4fd9d1f7ce5316eb1db66269a6ccc25ed1',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: 'c948962854e6acc994449544d19e48aa08880ec64b0f30b83c31e59782528255:flow.AccountContractAdded',
            transactionId: 'c948962854e6acc994449544d19e48aa08880ec64b0f30b83c31e59782528255',
            type: 'flow.AccountContractAdded',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                address: '0xf8d6e0586b0a20c7',
                codeHash: [
                    70, 232, 67, 4, 254, 86, 228, 7, 50, 231, 40, 97, 73, 176, 162, 31, 161, 60, 181, 91, 248, 254, 48,
                    242, 93, 105, 135, 202, 234, 90, 34, 27,
                ],
                contract: 'HelloWorld',
            },
        },
        {
            createdAt: 1633711711619,
            _id: '05d4b1ed5adecc894775e8d3b40b8f1d8ff5956b1fee9c0c8646d3dccee91832:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: '05d4b1ed5adecc894775e8d3b40b8f1d8ff5956b1fee9c0c8646d3dccee91832',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: '49bc6765a7a42873bbf9775ce604fe7e66cbff69d05f7bd93d0286357772bbe2:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: '49bc6765a7a42873bbf9775ce604fe7e66cbff69d05f7bd93d0286357772bbe2',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: '65cf4573d765628e1286ec9bc3bc9bc86a3b84fe5136e07d051cac9045e07de2:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: '65cf4573d765628e1286ec9bc3bc9bc86a3b84fe5136e07d051cac9045e07de2',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: 'bc32b34fac00770ac4e2253c83138c5ce580647e1741ca945f51ca2f4f61d3bb:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: 'bc32b34fac00770ac4e2253c83138c5ce580647e1741ca945f51ca2f4f61d3bb',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: '77fafa99f01e94af2c63127f9711dfff7b7a2cad23a71ca5cc7dfc04ee0edc2d:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: '77fafa99f01e94af2c63127f9711dfff7b7a2cad23a71ca5cc7dfc04ee0edc2d',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: 'bf8e7a94a5c05349f5e10881c237733f9e92c169e2de08712d1e5d40d5ac8f60:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: 'bf8e7a94a5c05349f5e10881c237733f9e92c169e2de08712d1e5d40d5ac8f60',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: 'dadd886450e39b5782a161cc0c1b413dd5228ee88601e301f1b3bea9694d19c6:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: 'dadd886450e39b5782a161cc0c1b413dd5228ee88601e301f1b3bea9694d19c6',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: 'f749cde1b4290edc859a628b6a97f098d9906e190a7e7e39133ef09799aa09b5:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: 'f749cde1b4290edc859a628b6a97f098d9906e190a7e7e39133ef09799aa09b5',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
        {
            createdAt: 1633711711619,
            _id: '12b53de9405564e9d0fa415a69de93c3bf78674658b041e5702b07b2887bb2ae:A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionId: '12b53de9405564e9d0fa415a69de93c3bf78674658b041e5702b07b2887bb2ae',
            type: 'A.f8d6e0586b0a20c7.HelloWorld.Greet',
            transactionIndex: 1,
            eventIndex: 0,
            data: {
                x: 'Hello, World!',
            },
        },
    ];

    const eventDetails = [
        { name: 'amount', type: 'VFI64', value: '0.001' },
        { name: 'from', type: 'VFI64', value: '0.002' },
    ];

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item, i) => (
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
        </>
    );
};

export default Events;
