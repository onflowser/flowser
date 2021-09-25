import React, { FunctionComponent } from 'react';
import './Layout.module.scss';

interface OwnProps {
    some: string;
}

type Props = OwnProps;

const Layout: FunctionComponent<Props> = (props) => {
    return (
        <>
            <div className="layout-root">
                <div></div>
                <div></div>
                {props.children}
            </div>
        </>
    );
};

export default Layout;
