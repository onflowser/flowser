import React, { FunctionComponent } from 'react';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Transactions: FunctionComponent<Props> = (props) => {
    return (
        <div>
            <h2>Transactions</h2>
        </div>
    );
};

export default Transactions;
