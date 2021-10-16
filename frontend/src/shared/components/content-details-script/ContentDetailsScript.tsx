import React, { FunctionComponent } from 'react';
import CadenceSourceCode from '../cadence-source-code/CadenceSourceCode';
import Card from '../card/Card';
import classes from './ContentDetailsScript.module.scss';
import Label from '../label/Label';
import Ellipsis from '../ellipsis/Ellipsis';
import Value from '../value/Value';
import CopyButton from '../copy-button/CopyButton';

interface TransactionArg {
    type: string;
    value: string;
}

interface OwnProps {
    script: string;
    args?: TransactionArg[];
}

type Props = OwnProps;

const ContentDetailsScript: FunctionComponent<Props> = ({ script, args }) => {
    return (
        <Card variant="black" className={classes.root}>
            {!!args?.length && (
                <>
                    <div className={classes.params}>
                        <Label className={classes.argsTitle}>ARGS:</Label>

                        {args.map((arg, index) => (
                            <div key={index} className={classes.argListItem}>
                                <span>{'>'}</span>
                                <Label>ARG:</Label>
                                <Value className={classes.value}>{`{${index}}`}</Value>

                                <Label>TYPE:</Label>
                                <Value className={classes.value}>{arg.type}</Value>

                                <Label>VALUE:</Label>
                                <Value className={classes.value}>
                                    <Ellipsis className={classes.argValue}>{arg.value}</Ellipsis>
                                </Value>

                                <CopyButton value={arg.value} />
                            </div>
                        ))}
                    </div>
                    <Label className={classes.codeTitle}>CODE:</Label>
                </>
            )}
            <CadenceSourceCode script={script} />
        </Card>
    );
};

export default ContentDetailsScript;
