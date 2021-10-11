import React, { FunctionComponent } from 'react';
import CadenceSourceCode from '../cadence-source-code/CadenceSourceCode';

interface OwnProps {
    script: string;
}

type Props = OwnProps;

const ContentDetailsScript: FunctionComponent<Props> = ({ script }) => {
    return <CadenceSourceCode script={script} />;
};

export default ContentDetailsScript;
