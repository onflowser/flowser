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
    const { size } = useLogDrawer();
    const getLogDrawerLayoutClass = useCallback(() => {
        return size === 'tiny' ? '' : size === 'small' ? classes.contentSmall : classes.noContent;
    }, [size]);

    return (
        <div className={`${classes.layoutContainer} ${getLogDrawerLayoutClass()}`}>
            <Navigation className={classes.navigation} />
            <SubNavigation className={classes.subNavigation} />
            <Content className={classes.content}>{children} </Content>
            <Logs className={classes.logs} />
        </div>
    );
};

export default Layout;
