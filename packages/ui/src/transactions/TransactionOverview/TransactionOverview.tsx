import React, { ReactElement } from "react";
import {
  DetailsCard,
  DetailsCardColumn,
} from "../../common/cards/DetailsCard/DetailsCard";
import { ExecutionStatusBadge } from "../../common/status/ExecutionStatusBadge";
import { GrcpStatusBadge } from "../../common/status/GrcpStatusBadge";
import { AccountLink } from "../../accounts/AccountLink/AccountLink";
import { DateDisplay } from "../../common/time/DateDisplay/DateDisplay";
import { FlowTransaction } from "@onflowser/api";
import { TransactionLink } from "../TransactionLink/TransactionLink";
import { BlockLink } from "../../blocks/BlockLink/BlockLink";

type TransactionOverviewProps = {
  transaction: FlowTransaction;
  className?: string;
};

export function TransactionOverview(
  props: TransactionOverviewProps,
): ReactElement {
  const { transaction } = props;

  const detailsColumns: DetailsCardColumn[] = [
    [
      {
        label: "Transaction",
        value: <TransactionLink transactionId={transaction.id} />,
      },
      {
        label: "Block ID",
        value: <BlockLink blockId={transaction.blockId} />,
      },
      {
        label: "Status",
        value: <ExecutionStatusBadge status={transaction.status} />,
      },
      {
        label: "Execution",
        value: <GrcpStatusBadge status={transaction.status} />,
      },
      {
        label: "Created date",
        value: <DateDisplay date={transaction.createdAt.toISOString()} />,
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

  return <DetailsCard columns={detailsColumns} className={props.className} />;
}
