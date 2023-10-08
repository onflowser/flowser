import React, { FunctionComponent } from "react";
import classes from "./AccountDetails.module.scss";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import {
  useGetAccount,
  useGetPollingContractsByAccount,
  useGetPollingKeysByAccount,
  useGetPollingTransactionsByAccount,
} from "../../../../../frontend/src/hooks/use-api";
import {
  DetailsCard,
  DetailsCardColumn,
} from "../../common/cards/DetailsCard/DetailsCard";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { AccountAvatar } from "../AccountAvatar/AccountAvatar";
import { AccountName } from "../AccountName/AccountName";
import { StyledTabs } from "../../common/tabs/StyledTabs/StyledTabs";
import { AccountStorage } from "../AccountStorage/AccountStorage";
import { TransactionsTable } from "../../transactions/TransactionsTable/TransactionsTable";
import { ContractsTable } from "../../contracts/ContractsTable/ContractsTable";
import { AccountKeysTable } from "../AccountKeysTable/AccountKeysTable";
import { CadenceEditor } from "../../common/code/CadenceEditor/CadenceEditor";
import { BaseTabItem } from "../../common/tabs/BaseTabs/BaseTabs";
import { DateDisplay } from "../../common/time/DateDisplay/DateDisplay";

type AccountDetailsProps = {
  accountId: string;
};

export const AccountDetails: FunctionComponent<AccountDetailsProps> = (
  props
) => {
  const { accountId } = props;
  const { data, isLoading } = useGetAccount(accountId);
  const { data: transactions } = useGetPollingTransactionsByAccount(accountId);
  const { data: contracts } = useGetPollingContractsByAccount(accountId);
  const { data: keys } = useGetPollingKeysByAccount(accountId);
  const { account } = data ?? {};

  if (isLoading || !account) {
    return <FullScreenLoading />;
  }

  const detailsColumns: DetailsCardColumn[] = [
    [
      {
        label: "Address",
        value: (
          <>
            <AccountAvatar address={account.address} />
            <SizedBox width={10} />
            <AccountName address={account.address} />
          </>
        ),
      },
      {
        label: "Balance",
        value: (
          <>
            {account.balance}
            <span className={classes.flowCurrency}>FLOW</span>
          </>
        ),
      },
      {
        label: "Created date",
        value: <DateDisplay date={account.createdAt} />,
      },
    ],
  ];

  const tabs: BaseTabItem[] = [
    {
      id: "storage",
      label: "Storage",
      content: <AccountStorage account={account} />,
    },
    {
      id: "transactions",
      label: "Transactions",
      content: <TransactionsTable transactions={transactions} />,
    },
    {
      id: "contracts",
      label: "Contracts",
      content: <ContractsTable contracts={contracts} />,
    },
    {
      id: "keys",
      label: "Keys",
      content: <AccountKeysTable keys={keys} />,
    },
  ];

  if (account.code) {
    tabs.push({
      id: "scripts",
      label: "Scripts",
      content: <CadenceEditor value={account.code} editable={false} />,
    });
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <DetailsCard className={classes.detailsCard} columns={detailsColumns} />
      </div>
      <SizedBox height={30} />
      <StyledTabs tabs={tabs} />
    </div>
  );
};
