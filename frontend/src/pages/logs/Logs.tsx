import React, { FunctionComponent } from 'react';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Logs: FunctionComponent<Props> = (props) => {
    return (
        <div>
            <h2>Logs</h2>
        </div>
    );
};

export default Logs;
