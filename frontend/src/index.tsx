import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { QueryClientProvider } from 'react-query';
import query from './shared/config/query';
import splitbee from '@splitbee/web';

// init analytics
if (process.env.NODE_ENV !== 'development') {
    splitbee.init({
        token: 'B3B9T4Z4SRQ3',
        disableCookie: true,
    });
}

ReactDOM.render(
    <React.StrictMode>
        <QueryClientProvider client={query}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
