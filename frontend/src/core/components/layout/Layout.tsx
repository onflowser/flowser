import React, { FunctionComponent, useCallback } from 'react';
import classes from './Layout.module.scss';
import Navigation from '../navigation/Navigation';
import Content from '../content/Content';
import SubNavigation from '../subnavigation/SubNavigation';
import Logs from '../../../pages/logs/Logs';
import { useLogDrawer } from '../../../shared/hooks/log-drawer';

interface OwnProps {
    children?: any;
}

type Props = OwnProps;

const Layout: FunctionComponent<Props> = ({ children }) => {
    const { logDrawerSize } = useLogDrawer();
    const getLogDrawerLayoutClass = useCallback(() => {
        return logDrawerSize === 'tiny' ? '' : logDrawerSize === 'small' ? classes.opened : classes.expanded;
    }, [logDrawerSize]);

    return (
        <div className={`${classes.layoutContainer}`}>
            <Navigation className={classes.navigation} />
            <SubNavigation className={classes.subNavigation} />
            <Content className={classes.content}>{children} </Content>
            <Logs className={`${classes.logs} ${getLogDrawerLayoutClass()}`} />
        </div>
    );
};

export default Layout;
