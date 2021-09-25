import React, { FunctionComponent } from 'react';

interface OwnProps {
    some?: any;
}

type Props = OwnProps;

const Accounts: FunctionComponent<Props> = (props) => {
    return (
        <div>
            <h2>Accounts</h2>
        </div>
    );
};

export default Accounts;
