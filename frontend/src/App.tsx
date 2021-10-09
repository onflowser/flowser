import React, { Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './core/components/layout/Layout';
import Start from './pages/start/Start';
import { routes } from './shared/constants/routes';
import { UiStateContextProvider } from './shared/contexts/ui-state.context';
import { useSearch } from './shared/hooks/search';
import './App.scss';

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

const BrowserRouterEvents = withRouter(({ children, history }) => {
    const { setSearchTerm } = useSearch();
    history.listen((location: any, action: any) => {
        if (action === 'PUSH') {
            setSearchTerm('');
        }
    });
    return <>{children}</>;
});
// TODO: Move to some config
const toastOptions = {
    className: '',
    duration: 2000,
    style: {
        background: '#88C4F2', // $color-link-blue
        color: '#202A40', // $color-table-blue
        padding: '12px', // $spacing-base
        maxWidth: 'initial',
    },
};

export const App = () => {
    return (
        <Suspense fallback="loading ...">
            <UiStateContextProvider>
                <BrowserRouter>
                    <BrowserRouterEvents>
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
                        <Toaster position="bottom-center" gutter={8} toastOptions={toastOptions} />
                    </BrowserRouterEvents>
                </BrowserRouter>
            </UiStateContextProvider>
        </Suspense>
    );
};

export default App;
