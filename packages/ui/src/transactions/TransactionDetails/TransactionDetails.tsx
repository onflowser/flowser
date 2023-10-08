import React, { FunctionComponent } from "react";
import classes from "./TransactionDetails.module.scss";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import { useGetTransaction } from "../../../../../frontend/src/hooks/use-api";
import { TransactionOverview } from "../TransactionOverview/TransactionOverview";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { TransactionDetailsTabs } from "../TransactionDetailsTabs/TransactionDetailsTabs";

type TransactionDetailsProps = {
  transactionId: string;
};

// TODO(restructure): Move this to app dir
export const TransactionDetails: FunctionComponent<TransactionDetailsProps> = (
  props
) => {
  const { transactionId } = props;
  const { data, isLoading } = useGetTransaction(transactionId);
  const { transaction } = data ?? {};

  if (isLoading || !transaction) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <TransactionOverview transaction={transaction} />
      <SizedBox height={30} />
      <TransactionDetailsTabs
        transaction={transaction}
        includeScriptTab={true}
        includeOverviewTab={false}
      />
    </div>
  );
};
