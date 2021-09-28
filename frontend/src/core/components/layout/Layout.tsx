import React, { FunctionComponent } from 'react';
import './Layout.module.scss';
import Navigation from '../navigation/Navigation';
import Content from '../content/Content';
import SubNavigation from '../subnavigation/SubNavigation';

interface OwnProps {
    children?: any;
}

type Props = OwnProps;

const Layout: FunctionComponent<Props> = ({ children }) => {
    return (
        <div className="layout-container">
            <Navigation />
            <SubNavigation />
            <Content>{children}</Content>
        </div>
    );
};

export default Layout;
