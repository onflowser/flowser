import React, { FunctionComponent } from 'react';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Contracts: FunctionComponent<Props> = (props) => {
    return (
        <div>
            <h2>Contracts</h2>
        </div>
    );
};

export default Contracts;
