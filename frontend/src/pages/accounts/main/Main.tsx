import React, { FunctionComponent, useEffect } from 'react';
import classes from './Main.module.scss';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import { useNavigation } from '../../../shared/hooks/navigation';
import { NavLink } from 'react-router-dom';
import { useSearch } from '../../../shared/hooks/search';
import { useFilterData } from '../../../shared/hooks/filter-data';

const Main: FunctionComponent<any> = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();

    useEffect(() => {
        setPlaceholder('search for block numbers or tx hashes');
        showNavigationDrawer(false);
        showSubNavigation(true);
    }, []);

    // TODO: remove
    const data = [
        {
            address: '0x00daAf23dDa4Ff97D0182D550E4BA9A74d6F291E',
            balance: '200.0 ETH',
            keyCount: 0,
            txCount: 0,
            index: 0,
        },
        {
            address: '0x0bdaAf23dDa4Ff97D0182D550E4BA9A74d6F291E',
            balance: '100.0 ETH',
            keyCount: 0,
            txCount: 0,
            index: 0,
        },
        {
            address: '0x9gyaAf23dDa4Ff97D0182D550E4BA9A74d6F291E',
            balance: '300.0 ETH',
            keyCount: 0,
            txCount: 0,
            index: 0,
        },
        {
            address: '0x0bdaAf23dDa4Ff97D0182D550E4BA9A74d6F291E',
            balance: '100.0 ETH',
            keyCount: 0,
            txCount: 0,
            index: 0,
        },
        {
            address: '0x0000f23dDa4Ff97D0182D550E4BA9A74d6F291E',
            balance: '100.0 ETH',
            keyCount: 0,
            txCount: 0,
            index: 0,
        },
    ];

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item, i) => (
                    <Card key={i} className={classes.card}>
                        <div>
                            <Label>ADDRESS</Label>
                            <Value>
                                <NavLink to={`/accounts/details/${item.address}`}>{item.address}</NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>BALANCE</Label>
                            <Value>{item.balance}</Value>
                        </div>
                        <div>
                            <Label>KEY COUNT</Label>
                            <Value>{item.keyCount}</Value>
                        </div>
                        <div>
                            <Label>TX COUNT</Label>
                            <Value>{item.txCount}</Value>
                        </div>
                        <div>
                            <Label>INDEX</Label>
                            <Value>{item.index}</Value>
                        </div>
                    </Card>
                ))}
        </>
    );
};

export default Main;
