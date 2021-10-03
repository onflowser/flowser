import React, { FunctionComponent } from 'react';
import classes from './Layout.module.scss';
import Navigation from '../navigation/Navigation';
import Content from '../content/Content';
import SubNavigation from '../subnavigation/SubNavigation';
import Logs from '../../../pages/logs/Logs';

interface OwnProps {
    children?: any;
}

type Props = OwnProps;

const Layout: FunctionComponent<Props> = ({ children }) => {
    return (
        <div className={classes.layoutContainer}>
            <Navigation className={classes.header} />
            <SubNavigation className={classes.subheader} />
            <Content className={classes.content}>{children} </Content>
            <Logs className={classes.logs} />
        </div>
    );
};

export default Layout;
