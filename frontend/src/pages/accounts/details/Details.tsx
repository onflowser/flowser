import React, { FunctionComponent } from "react";
import classes from "./Details.module.scss";
import { useParams } from "react-router-dom";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import {
  useGetAccount,
  useGetPollingContractsByAccount,
  useGetPollingKeysByAccount,
  useGetPollingTransactionsByAccount,
} from "../../../hooks/use-api";
import {
  DetailsCard,
  DetailsCardColumn,
} from "components/details-card/DetailsCard";
import { TextUtils } from "../../../utils/text-utils";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { AccountAvatar } from "../../../components/account/avatar/AccountAvatar";
import { AccountName } from "../../../components/account/name/AccountName";
import { StyledTabs } from "../../../components/tabs/StyledTabs";
import { AccountStorage } from "./storage/AccountStorage";
import { TransactionsTable } from "../../transactions/main/TransactionsTable";
import { ContractsTable } from "../../contracts/ContractsTable";
import { KeysTable } from "./KeysTable";
import { CadenceEditor } from "../../../components/cadence-editor/CadenceEditor";

export type AccountDetailsRouteParams = {
  accountId: string;
};

export const AccountDetails: FunctionComponent = () => {
  const { accountId } = useParams<AccountDetailsRouteParams>();
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
            <span className={classes.currency}>FLOW</span>
          </>
        ),
      },
      {
        label: "Created date",
        value: TextUtils.longDate(account.createdAt),
      },
    ],
  ];

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <DetailsCard className={classes.detailsCard} columns={detailsColumns} />
      </div>
      <SizedBox height={30} />
      <StyledTabs
        tabs={[
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
            content: <KeysTable keys={keys} />,
          },
          {
            id: "scripts",
            label: "Scripts",
            content: <CadenceEditor value={account.code} editable={false} />,
          },
        ]}
      />
    </div>
  );
};
