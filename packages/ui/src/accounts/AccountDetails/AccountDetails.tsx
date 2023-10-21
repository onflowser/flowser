import React, { FunctionComponent } from "react";
import classes from "./AccountDetails.module.scss";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
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
import {
  useGetAccount,
  useGetContractsByAccount,
  useGetKeysByAccount,
  useGetStoragesByAccount,
  useGetTransactionsByAccount,
} from "../../api";

type AccountDetailsProps = {
  accountId: string;
};

export const AccountDetails: FunctionComponent<AccountDetailsProps> = (
  props
) => {
  const { accountId } = props;
  const { data: account, isLoading } = useGetAccount(accountId);
  const { data: transactions } = useGetTransactionsByAccount(accountId);
  const { data: contracts } = useGetContractsByAccount(accountId);
  const { data: keys } = useGetKeysByAccount(accountId);
  const { data: storageItems } = useGetStoragesByAccount(accountId);

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
        value: <DateDisplay date={account.createdAt.toISOString()} />,
      },
    ],
  ];

  const tabs: BaseTabItem[] = [
    {
      id: "storage",
      label: "Storage",
      content: storageItems ? (
        <AccountStorage storageItems={storageItems} />
      ) : (
        <FullScreenLoading />
      ),
    },
    {
      id: "transactions",
      label: "Transactions",
      content: transactions ? (
        <TransactionsTable transactions={transactions} />
      ) : (
        <FullScreenLoading />
      ),
    },
    {
      id: "contracts",
      label: "Contracts",
      content: contracts ? (
        <ContractsTable contracts={contracts} />
      ) : (
        <FullScreenLoading />
      ),
    },
    {
      id: "keys",
      label: "Keys",
      content: keys ? <AccountKeysTable keys={keys} /> : <FullScreenLoading />,
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
