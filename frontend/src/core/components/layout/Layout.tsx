import React, { FunctionComponent } from 'react';
import './Layout.module.scss';

interface OwnProps {
}

type Props = OwnProps;

const Layout: FunctionComponent<Props> = (props) => {

    return (<>
        <div className="layout-root">
            <div></div>
            <div></div>
        </div>
    </>);
};

export default Layout;
