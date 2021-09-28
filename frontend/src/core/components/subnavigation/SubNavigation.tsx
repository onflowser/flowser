import React, { FunctionComponent } from 'react';
import classes from './SubNavigation.module.scss';
import Search from '../../../shared/components/search/Search';

const SubNavigation: FunctionComponent<any> = () => {
    return (
        <div className={classes.container}>
            <Search />
        </div>
    );
};

export default SubNavigation;
