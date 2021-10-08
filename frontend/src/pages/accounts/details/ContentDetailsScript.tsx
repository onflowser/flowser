import React, { FunctionComponent } from 'react';
import classes from './ContentDetailsScript.module.scss';
import Card from '../../../shared/components/card/Card';
import CadenceSourceCode from '../../../shared/components/cadence-source-code/CadenceSourceCode';

interface OwnProps {
    script: string;
}

type Props = OwnProps;

const ContentDetailsScript: FunctionComponent<Props> = ({ script }) => {
    return (
        <Card className={classes.root} variant="black">
            <CadenceSourceCode script={script} />
        </Card>
    );
};

export default ContentDetailsScript;
