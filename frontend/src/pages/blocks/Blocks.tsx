import React, { FunctionComponent } from 'react';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Blocks: FunctionComponent<Props> = (props) => {
    return (
        <div>
            <h2>Blocks</h2>
        </div>
    );
};

export default Blocks;
