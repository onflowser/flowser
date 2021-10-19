import React, { FunctionComponent, useEffect } from 'react';
import classes from './Main.module.scss';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import { useNavigation } from '../../../shared/hooks/navigation';
import { NavLink } from 'react-router-dom';
import { useSearch } from '../../../shared/hooks/search';
import { useFilterData } from '../../../shared/hooks/filter-data';
import { useTimeoutPolling } from '../../../shared/hooks/timeout-polling';

const Main: FunctionComponent<any> = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const { data } = useTimeoutPolling<any>('/api/accounts/polling');

    useEffect(() => {
        setPlaceholder('search for block numbers or tx hashes');
        showNavigationDrawer(false);
        showSubNavigation(true);
    }, []);

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item, i) => (
                    <Card key={i} className={`${classes.card} ${item.isNew && classes.isNew}`}>
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
                            <Value>{item.keys.length}</Value>
                        </div>
                        <div>
                            <Label>TX COUNT</Label>
                            <Value>{item.txCount}</Value>
                        </div>
                    </Card>
                ))}
        </>
    );
};

export default Main;
