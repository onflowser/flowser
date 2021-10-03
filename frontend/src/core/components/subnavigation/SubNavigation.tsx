import React, { FunctionComponent } from 'react';
import classes from './SubNavigation.module.scss';
import Search from '../../../shared/components/search/Search';

const SubNavigation: FunctionComponent<any> = (props: any) => {
    return (
        <div className={`${classes.container} ${props.className}`}>
            <Search />
        </div>
    );
};

export default SubNavigation;
