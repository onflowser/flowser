import React, { FunctionComponent, useEffect } from 'react';
import classes from './Main.module.scss';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import Value from '../../../shared/components/value/Value';
import { useNavigation } from '../../../shared/hooks/navigation';
import { NavLink } from 'react-router-dom';
import { useSearch } from '../../../shared/hooks/search';
import { useFilterData } from '../../../shared/hooks/filter-data';
import data from '../data.json';

const Main: FunctionComponent<any> = () => {
    const { searchTerm, setPlaceholder } = useSearch();
    const { showNavigationDrawer } = useNavigation();

    useEffect(() => {
        setPlaceholder('search for contracts');
        showNavigationDrawer(false);
    }, []);

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item, i) => (
                    <Card key={i} className={classes.card}>
                        <div>
                            <Label>NAME</Label>
                            <Value>
                                <NavLink to={`/contracts/details/${item._id}`}>{item.name}</NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>ACCOUNT</Label>
                            <Value>
                                <NavLink to={`/accounts/details/${item.accountAddress}`}>{item.accountAddress}</NavLink>
                            </Value>
                        </div>
                    </Card>
                ))}
        </>
    );
};

export default Main;
