import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import './App.scss';
import Layout from './core/components/layout/Layout';
import Start from './pages/start/Start';
import { routes } from './shared/constants/routes';

const LazyAccounts = React.lazy(() => import('./pages/accounts/Accounts'));
const LazyBlocks = React.lazy(() => import('./pages/blocks/Blocks'));
const LazyTransactions = React.lazy(() => import('./pages/transactions/Transactions'));
const LazyContracts = React.lazy(() => import('./pages/contracts/Contracts'));
const LazyEvents = React.lazy(() => import('./pages/events/Events'));
const LazyLogs = React.lazy(() => import('./pages/logs/Logs'));

const RouteWithLayout = (props: any) => (
    <Layout>
        <Route {...props} />
    </Layout>
);

function App() {
    return (
        <Suspense fallback="loading ...">
            <BrowserRouter>
                <Switch>
                    <Route exact path={`/${routes.start}`} component={Start} />
                    <RouteWithLayout path={`/${routes.accounts}`} component={LazyAccounts} />
                    <RouteWithLayout path={`/${routes.blocks}`} component={LazyBlocks} />
                    <RouteWithLayout path={`/${routes.transactions}`} component={LazyTransactions} />
                    <RouteWithLayout path={`/${routes.contracts}`} component={LazyContracts} />
                    <RouteWithLayout path={`/${routes.events}`} component={LazyEvents} />
                    <RouteWithLayout path={`/${routes.logs}`} component={LazyLogs} />
                    <Redirect from="*" to={`/${routes.start}`} />
                </Switch>
            </BrowserRouter>
        </Suspense>
    );
}

export default App;
