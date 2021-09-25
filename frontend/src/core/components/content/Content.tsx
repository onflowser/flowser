import React, { FunctionComponent } from 'react';
import classes from './Content.module.scss';

interface OwnProps {
    children?: any;
}

type Props = OwnProps;

const Content: FunctionComponent<Props> = ({ children }) => {
    return <div className={classes.contentContainer}>{children}</div>;
};

export default Content;
