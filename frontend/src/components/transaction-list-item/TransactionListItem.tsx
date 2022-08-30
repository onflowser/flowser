import React, { FunctionComponent } from "react";
import classes from "./TransactionListItem.module.scss";
import Card from "../card/Card";
import Label from "../label/Label";
import Value from "../value/Value";
import { NavLink } from "react-router-dom";
import Ellipsis from "../ellipsis/Ellipsis";
import TransactionStatusBadge from "../transaction-status-code/TransactionStatusBadge";
import { Transaction, TransactionStatusCode } from "@flowser/types";
import { DecoratedPollingEntity } from "../../hooks/use-timeout-polling";
import { FlowUtils } from "../../utils/flow-utils";

export type TransactionListItemProps = {
  className?: string;
  transaction: DecoratedPollingEntity<Transaction>;
};

const TransactionListItem: FunctionComponent<TransactionListItemProps> = ({
  transaction,
  className,
  ...restProps
}) => {
  const { id, blockId, status, payer, proposalKey } = transaction;
  return (
    <Card
      className={`${classes.card} ${className}`}
      showIntroAnimation={transaction.isNew || transaction.isUpdated}
      {...restProps}
    >
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
          <NavLink to={`/blocks/details/${blockId}`}>
            <Ellipsis className={classes.hash}>{blockId}</Ellipsis>
          </NavLink>
        </Value>
      </div>
      <div>
        <Label>GRCP STATUS</Label>
        <Value>
          {FlowUtils.getGrcpStatusName(transaction.status?.statusCode)}
        </Value>
      </div>
      <div>
        <Value>
          <TransactionStatusBadge
            statusCode={
              status?.status ?? TransactionStatusCode.TX_STATUS_UNKNOWN
            }
          />
        </Value>
      </div>
      <div>
        <Label>PAYER</Label>
        <Value>
          <NavLink to={`/accounts/details/${payer}`}>{payer}</NavLink>
        </Value>
      </div>
      <div>
        <Label>PROPOSER</Label>
        <Value>
          {proposalKey ? (
            <NavLink to={`/accounts/details/${proposalKey.address}`}>
              {proposalKey.address}
            </NavLink>
          ) : (
            "-"
          )}
        </Value>
      </div>
    </Card>
  );
};

export default TransactionListItem;
