import React, { FunctionComponent } from 'react';

interface OwnProps {
    some: string;
}

type Props = OwnProps;

const Start: FunctionComponent<Props> = (props) => {
    return <h1>Start</h1>;
};

export default Start;
