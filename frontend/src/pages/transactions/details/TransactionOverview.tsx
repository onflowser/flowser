import React, { ReactElement } from "react";
import {
  TableCard,
  DetailsCardColumn,
} from "@flowser/ui/cards/table/TableCard";
import MiddleEllipsis from "@flowser/ui/ellipsis/MiddleEllipsis";
import classes from "./Details.module.scss";
import { ExecutionStatusBadge } from "@flowser/ui/status/ExecutionStatusBadge";
import { GrcpStatusBadge } from "@flowser/ui/status/GrcpStatusBadge";
import { TextUtils } from "../../../utils/text-utils";
import { Transaction } from "@flowser/shared";
import { NavLink } from "react-router-dom";
import { AccountLink } from "@flowser/ui/account/link/AccountLink";

type TransactionOverviewProps = {
  transaction: Transaction;
};

export function TransactionOverview(
  props: TransactionOverviewProps
): ReactElement {
  const { transaction } = props;

  const detailsColumns: DetailsCardColumn[] = [
    [
      {
        label: "Transaction",
        value: (
          <>
            <NavLink to={`/transactions/details/${transaction.id}`}>
              <MiddleEllipsis className={classes.elipsis}>
                {transaction.id}
              </MiddleEllipsis>
            </NavLink>
            <ExecutionStatusBadge
              className={classes.txStatusBadge}
              status={transaction.status}
            />
          </>
        ),
      },
      {
        label: "API Status",
        value: <GrcpStatusBadge status={transaction.status} />,
      },
      {
        label: "Created date",
        value: TextUtils.longDate(transaction.createdAt),
      },
      {
        label: "Block ID",
        value: (
          <NavLink to={`/blocks/details/${transaction.blockId}`}>
            <MiddleEllipsis className={classes.elipsis}>
              {transaction.blockId}
            </MiddleEllipsis>
          </NavLink>
        ),
      },
    ],
    [
      {
        label: "Proposer",
        value: transaction.proposalKey ? (
          <AccountLink address={transaction.proposalKey.address} />
        ) : (
          <div>-</div>
        ),
      },
      {
        label: "Payer",
        value: <AccountLink address={transaction.payer} />,
      },
      {
        label: "Authorizers",
        value: (
          <>
            {transaction.authorizers.map((address) => (
              <AccountLink key={address} address={address} />
            ))}
          </>
        ),
      },
      {
        label: "Sequence nb.",
        value: <>{transaction.proposalKey?.sequenceNumber ?? "-"}</>,
      },
      {
        label: "Gas limit",
        value: `${transaction?.gasLimit}`,
      },
    ],
  ];

  return <TableCard columns={detailsColumns} />;
}
