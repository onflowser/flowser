import React, { FunctionComponent, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useFormattedDate } from '../../../shared/hooks/formatted-date';
import { useFilterData } from '../../../shared/hooks/filter-data';
import { useSearch } from '../../../shared/hooks/search';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import classes from './Main.module.scss';
import Ellipsis from '../../../shared/components/ellipsis/Ellipsis';
import { useNavigation } from '../../../shared/hooks/navigation';

const Main: FunctionComponent<any> = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const { formatDate } = useFormattedDate();
    // const { data } = useTimeoutPolling('/api/blocks/polling');

    useEffect(() => {
        setPlaceholder('Search for block ids, parent ids, time, ...');
        showNavigationDrawer(false);
        showSubNavigation(true);
    }, []);

    // TODO: Remove
    const data = [
        {
            createdAt: 1633698442496,
            _id: '38a334c2db31346325c80f0b70db182107a856475ed9ea78442edfa5fbba279a',
            blockId: '38a334c2db31346325c80f0b70db182107a856475ed9ea78442edfa5fbba279a',
            parentId: 'e8f54263b30f4804f89dfb686762e5a5a8c64cfae7e97642ec9994219ed02071',
            height: 3,
            timestamp: '2021-10-08T13:07:20.631Z',
            blockSeals: [],
            signatures: [''],
            collectionGuarantees: [
                {
                    collectionId: '1438df55840dc8cf5cfdcc5fc9311279110b1395b27f9b6fe105d49cdf33c6b5',
                    signatures: [''],
                },
            ],
        },
        {
            createdAt: 1633698442496,
            _id: 'e8f54263b30f4804f89dfb686762e5a5a8c64cfae7e97642ec9994219ed02071',
            blockId: 'e8f54263b30f4804f89dfb686762e5a5a8c64cfae7e97642ec9994219ed02071',
            parentId: '8913fea1d149877f52aa529a195b0e0c2107da51567771c6c024aa78101a52e2',
            height: 2,
            timestamp: '2021-10-08T13:07:20.334Z',
            blockSeals: [],
            signatures: [''],
            collectionGuarantees: [
                {
                    collectionId: 'a8713acd9c1707b9f08014509ec783f3726bcca5d7696dc1ad21f1d9efe242b7',
                    signatures: [''],
                },
            ],
        },
        {
            createdAt: 1633698442494,
            _id: '7bc42fe85d32ca513769a74f97f7e1a7bad6c9407f0d934c2aa645ef9cf613c7',
            blockId: '7bc42fe85d32ca513769a74f97f7e1a7bad6c9407f0d934c2aa645ef9cf613c7',
            parentId: '0000000000000000000000000000000000000000000000000000000000000000',
            height: 0,
            timestamp: '2018-12-19T22:32:30.000Z',
            blockSeals: [],
            signatures: [''],
            collectionGuarantees: [],
        },
        {
            createdAt: 1633698442496,
            _id: '8913fea1d149877f52aa529a195b0e0c2107da51567771c6c024aa78101a52e2',
            blockId: '8913fea1d149877f52aa529a195b0e0c2107da51567771c6c024aa78101a52e2',
            parentId: '7bc42fe85d32ca513769a74f97f7e1a7bad6c9407f0d934c2aa645ef9cf613c7',
            height: 1,
            timestamp: '2021-10-08T12:47:41.086Z',
            blockSeals: [],
            signatures: [''],
            collectionGuarantees: [
                {
                    collectionId: 'b32b9a5f88b996181ca39217a1b6a0d17dac78f48922d3823e7a94f74646f33f',
                    signatures: [''],
                },
            ],
        },
        {
            createdAt: 1633698442496,
            _id: 'b8dad2e826e6fd363ed43039ea68fc3ae471c3ea40c996d2c648cc57475466f0',
            blockId: 'b8dad2e826e6fd363ed43039ea68fc3ae471c3ea40c996d2c648cc57475466f0',
            parentId: '38a334c2db31346325c80f0b70db182107a856475ed9ea78442edfa5fbba279a',
            height: 4,
            timestamp: '2021-10-08T13:07:21.056Z',
            blockSeals: [],
            signatures: [''],
            collectionGuarantees: [
                {
                    collectionId: 'ce8a4b607f7b1b429ee081888ea32b198daaa8dd99bbec015b7f1fc7bb6a7c75',
                    signatures: [''],
                },
            ],
        },
        {
            createdAt: 1633698442496,
            _id: '0ee11d607c29eae94695b56e2c64b42a067a2d8b98cbf342e76c7052d7e4f6b7',
            blockId: '0ee11d607c29eae94695b56e2c64b42a067a2d8b98cbf342e76c7052d7e4f6b7',
            parentId: 'b8dad2e826e6fd363ed43039ea68fc3ae471c3ea40c996d2c648cc57475466f0',
            height: 5,
            timestamp: '2021-10-08T13:07:21.433Z',
            blockSeals: [],
            signatures: [''],
            collectionGuarantees: [
                {
                    collectionId: '203513dc91d1009699a65674844f30b4991f136f85896af42a82d303c8f6699a',
                    signatures: [''],
                },
            ],
        },
    ];
    const { filteredData } = useFilterData(data, searchTerm);

    useEffect(() => {
        console.log('filtered data changed', filteredData);
    }, [filteredData]);

    return (
        <>
            {filteredData &&
                filteredData.map((item, i) => (
                    <Card key={i} className={`${classes.card} ${i + 1 === filteredData.length ? classes.isNew : ''}`}>
                        <div>
                            <Label>BLOCK HEIGHT</Label>
                            <Value>{item.height}</Value>
                        </div>
                        <div>
                            <Label>BLOCK ID</Label>
                            <Value>
                                <NavLink to={`/blocks/details/${item.blockId}`}>
                                    <Ellipsis className={classes.hash}>{item.blockId}</Ellipsis>
                                </NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>PARENT ID</Label>
                            <Value>
                                <NavLink to={`/blocks/details/${item.parentId}`}>
                                    <Ellipsis className={classes.hash}>{item.parentId}</Ellipsis>
                                </NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>TIME</Label>
                            <Value>{formatDate(item.timestamp)}</Value>
                        </div>
                        <div>
                            <Label>COLLECTION GUARANTEES</Label>
                            <Value>{item.collectionGuarantees.length}</Value>
                        </div>
                        <div>
                            <Label>BLOCK SEALS</Label>
                            <Value>{item.blockSeals.length}</Value>
                        </div>
                        <div>
                            <Label>SIGNATURES</Label>
                            <Value>{item.signatures.length}</Value>
                        </div>
                    </Card>
                ))}
        </>
    );
};

export default Main;
