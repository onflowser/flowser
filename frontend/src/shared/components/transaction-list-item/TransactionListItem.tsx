import React, { FunctionComponent } from 'react';
import classes from './TransactionListItem.module.scss';
import Card from '../card/Card';
import Label from '../label/Label';
import Value from '../value/Value';
import { NavLink } from 'react-router-dom';
import Ellipsis from '../ellipsis/Ellipsis';
import TransactionStatusCode from '../transaction-status-code/TransactionStatusCode';

interface OwnProps {
    id: string;
    referenceBlockId: string;
    statusCode: number;
    payer: string;
    proposer: string;
}

type Props = OwnProps;

const TransactionListItem: FunctionComponent<Props> = ({
    id,
    referenceBlockId,
    statusCode,
    payer,
    proposer,
    ...restProps
}) => {
    return (
        <Card className={classes.card} {...restProps}>
            <div>
                <Label>TRANSACTION ID</Label>
                <Value>
                    <NavLink to={`/transactions/details/${id}`}>
                        <Ellipsis className={classes.hash}>{id}</Ellipsis>
                    </NavLink>
                </Value>
            </div>
            <div>
                <Label>BLOCK ID</Label>
                <Value>
                    <NavLink to={`/blocks/details/${referenceBlockId}`}>
                        <Ellipsis className={classes.hash}>{referenceBlockId}</Ellipsis>
                    </NavLink>
                </Value>
            </div>
            <div>
                <TransactionStatusCode statusCode={statusCode} />
            </div>
            <div>
                <Label>PAYER</Label>
                <Value>{payer}</Value>
            </div>
            <div>
                <Label>PROPOSER</Label>
                <Value>{proposer}</Value>
            </div>
        </Card>
    );
};

export default TransactionListItem;
