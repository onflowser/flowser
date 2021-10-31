import React, { FunctionComponent } from 'react';
import classes from './ListContainer.module.scss';

const ListContainer: FunctionComponent = ({ children }) => {
    return <div className={classes.listContainer}>{children}</div>;
};

export default ListContainer;
