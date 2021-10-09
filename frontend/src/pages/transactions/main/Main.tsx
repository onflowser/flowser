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
        setPlaceholder('search for block numbers or tx hashes');
        showNavigationDrawer(false);
    }, []);

    const { filteredData } = useFilterData(data, searchTerm);

    return (
        <>
            {filteredData &&
                filteredData.map((item, i) => (
                    <Card key={i} className={classes.card}>
                        <div>
                            <Label>ID</Label>
                            <Value>
                                <NavLink to={`/transactions/details/${item._id}`}>{item._id}</NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>BLOCK</Label>
                            <Value>
                                <NavLink to={`/blocks/details/${item.referenceBlockId}`}>
                                    {item.referenceBlockId}
                                </NavLink>
                            </Value>
                        </div>
                        <div>
                            <Label>GAS LIMIT</Label>
                            <Value>{item.gasLimit}</Value>
                        </div>
                        <div>
                            <Label>PAYER</Label>
                            <Value>{item.payer}</Value>
                        </div>
                    </Card>
                ))}
        </>
    );
};

export default Main;
