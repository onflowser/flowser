import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Main from './main/Main';
import Details from './details/Details';

const Blocks = () => {
    return (
        <Switch>
            <Route exact path={`/blocks`} component={Main} />
            <Route path={`/blocks/details/:blockId`} component={Details} />
            <Redirect from="*" to={`/blocks`} />
        </Switch>
    );
};

export default Blocks;
