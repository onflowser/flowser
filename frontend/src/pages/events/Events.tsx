import React, { FunctionComponent } from 'react';

interface OwnProps {
    some?: string;
}

type Props = OwnProps;

const Events: FunctionComponent<Props> = (props) => {
    return (
        <div>
            <h2>Events</h2>
        </div>
    );
};

export default Events;
