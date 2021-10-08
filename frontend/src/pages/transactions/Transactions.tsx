import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Main from './main/Main';
import Details from './details/Details';

const Transactions = () => {
    return (
        <Switch>
            <Route exact path={`/transactions`} component={Main} />
            <Route path={`/transactions/details/:transactionId`} component={Details} />
            <Redirect from="*" to={`/transactions`} />
        </Switch>
    );
};

export default Transactions;
