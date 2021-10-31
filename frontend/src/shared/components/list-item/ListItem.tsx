import React, { FunctionComponent } from 'react';
import classes from './ListItem.module.scss';

type Props = {
    isNew: boolean;
};

const ListItem: FunctionComponent<Props> = ({ isNew, children }) => {
    return <span className={`${isNew ? classes.listItem__new : classes.listItem}`}>{children}</span>;
};

export default ListItem;
