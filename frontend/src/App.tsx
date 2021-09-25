import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import Layout from './core/components/layout/Layout';
import Start from './pages/start/Start';

const LazyAccounts = React.lazy(() => import('./pages/accounts/Accounts'));
const LazyBlocks = React.lazy(() => import('./pages/blocks/Blocks'));
const LazyTransactions = React.lazy(() => import('./pages/transactions/Transactions'));
const LazyContracts = React.lazy(() => import('./pages/contracts/Contracts'));
const LazyEvents = React.lazy(() => import('./pages/events/Events'));
const LazyLogs = React.lazy(() => import('./pages/logs/Logs'));

function App() {
    return (
        <Suspense fallback="loading ...">
            <BrowserRouter>
                <Layout>
                    <Switch>
                        <Route exact path="/start" component={Start} />
                        <Route path="/accounts" component={LazyAccounts} />
                        <Route path="/blocks" component={LazyBlocks} />
                        <Route path="/transactions" component={LazyTransactions} />
                        <Route path="/contracts" component={LazyContracts} />
                        <Route path="/events" component={LazyEvents} />
                        <Route path="/logs" component={LazyLogs} />
                        <Redirect from="/" to="start" />
                    </Switch>
                </Layout>
            </BrowserRouter>
        </Suspense>
    );
}

export default App;
