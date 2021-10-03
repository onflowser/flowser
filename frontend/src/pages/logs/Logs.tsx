import React, { FunctionComponent } from 'react';

interface OwnProps {
    className?: any;
}

type Props = OwnProps;

const Logs: FunctionComponent<Props> = ({ className }) => {
    return (
        <div className={className}>
            <p>Logs</p>
        </div>
    );
};

export default Logs;
