import React, { FunctionComponent } from "react";
import classes from "./TransactionDetails.module.scss";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import { TransactionOverview } from "../TransactionOverview/TransactionOverview";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { TransactionDetailsTabs } from "../TransactionDetailsTabs/TransactionDetailsTabs";
import { useGetTransaction } from "../../api";

type TransactionDetailsProps = {
  transactionId: string;
};

export const TransactionDetails: FunctionComponent<TransactionDetailsProps> = (
  props,
) => {
  const { transactionId } = props;
  const { data: transaction, isLoading } = useGetTransaction(transactionId);

  if (isLoading || !transaction) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <TransactionOverview transaction={transaction} />
      <SizedBox height={30} />
      <TransactionDetailsTabs
        contentClassName={classes.tabContent}
        transaction={transaction}
        includeScriptTab={true}
        includeOverviewTab={false}
      />
    </div>
  );
};
