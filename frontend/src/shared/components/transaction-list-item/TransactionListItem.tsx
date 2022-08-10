import React, { FunctionComponent } from "react";
import classes from "./TransactionListItem.module.scss";
import Card from "../card/Card";
import Label from "../label/Label";
import Value from "../value/Value";
import { NavLink } from "react-router-dom";
import Ellipsis from "../ellipsis/Ellipsis";
import TransactionStatusBadge from "../transaction-status-code/TransactionStatusBadge";
import { TransactionStatusCode } from "@flowser/types/generated/entities/transactions";

type TransactionListItemProps = {
  id: string;
  referenceBlockId: string;
  statusCode: TransactionStatusCode | undefined;
  payer: string;
  proposer: string;
  className?: string;
};

const TransactionListItem: FunctionComponent<TransactionListItemProps> = ({
  id,
  referenceBlockId,
  statusCode,
  payer,
  proposer,
  className,
  ...restProps
}) => {
  return (
    <Card className={`${classes.card} ${className}`} {...restProps}>
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
        <TransactionStatusBadge statusCode={statusCode} />
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
