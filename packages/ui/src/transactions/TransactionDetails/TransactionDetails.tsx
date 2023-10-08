import React, { FunctionComponent } from "react";
import classes from "./TransactionDetails.module.scss";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import { useFlowserHooksApi } from "../../contexts/flowser-api.context";
import { TransactionOverview } from "../TransactionOverview/TransactionOverview";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { TransactionDetailsTabs } from "../TransactionDetailsTabs/TransactionDetailsTabs";

type TransactionDetailsProps = {
  transactionId: string;
};

export const TransactionDetails: FunctionComponent<TransactionDetailsProps> = (
  props
) => {
  const { transactionId } = props;
  const api = useFlowserHooksApi();
  const { data: transaction, isLoading } = api.useGetTransaction(transactionId);

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
