import React, { FunctionComponent, useEffect, useState } from "react";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import classes from "./Details.module.scss";
import Value from "../../../components/value/Value";
import Label from "../../../components/label/Label";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import CopyButton from "../../../components/buttons/copy-button/CopyButton";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import { NavLink, useParams } from "react-router-dom";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import {
  useGetAccount,
  useGetPollingContractsByAccount,
  useGetPollingKeysByAccount,
  useGetPollingStorageByAccount,
  useGetPollingTransactionsByAccount,
} from "../../../hooks/use-api";
import { createColumnHelper } from "@tanstack/table-core";
import {
  AccountContract,
  AccountKey,
  AccountStorageDomain,
  Transaction,
} from "@flowser/shared";
import { FlowUtils } from "../../../utils/flow-utils";
import Table from "../../../components/table/Table";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import Badge from "../../../components/badge/Badge";
import { PublicPrivateStorageCard } from "./storage/cards/PublicPrivateStorageCard";
import { InternalStorageCard } from "./storage/cards/InternalStorageCard";
import classNames from "classnames";
import { useUrlQuery } from "../../../hooks/use-url-query";
import {
  DetailsCard,
  DetailsCardColumn,
} from "components/details-card/DetailsCard";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { useAnalytics } from "../../../hooks/use-analytics";
import { AnalyticEvent } from "../../../services/analytics.service";
import { TextUtils } from "../../../utils/text-utils";
import { transactionTableColumns } from "../../transactions/main/Main";
import { enableDetailsIntroAnimation } from "../../../config/common";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { AccountAvatar } from "../../../components/account/avatar/AccountAvatar";
import { AccountName } from "../../../components/account/name/AccountName";
import { StyledTabs } from "../../../components/tabs/StyledTabs";
import { AccountStorage } from "./storage/AccountStorage";

export type AccountDetailsRouteParams = {
  accountId: string;
};

// CONTRACTS TABLE
const columnHelperContracts =
  createColumnHelper<DecoratedPollingEntity<AccountContract>>();

const columnsContract = [
  columnHelperContracts.accessor("name", {
    header: () => <Label variant="medium">NAME</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/contracts/details/${info.row.original.id}`}>
          {info.row.original.name}
        </NavLink>
      </Value>
    ),
  }),
  columnHelperContracts.accessor("accountAddress", {
    header: () => <Label variant="medium">ACCOUNT</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          {info.getValue()}
        </NavLink>
      </Value>
    ),
  }),
];

// KEYS TABLE
const columnHelperKeys =
  createColumnHelper<DecoratedPollingEntity<AccountKey>>();

const columnsKeys = [
  columnHelperKeys.accessor("accountAddress", {
    header: () => <Label variant="medium">KEY</Label>,
    cell: (info) => (
      <div className={classes.keysRoot}>
        <div className={classes.row}>
          <MiddleEllipsis className={classes.hash}>
            {info.row.original.publicKey}
          </MiddleEllipsis>
          <CopyButton value={info.row.original.publicKey} />
        </div>
        <div className={classNames(classes.badges, classes.row)}>
          <Badge>WEIGHT: {info.row.original.weight}</Badge>
          <Badge>SEQ. NUMBER: {info.row.original.sequenceNumber}</Badge>
          <Badge>INDEX: {info.row.original.index}</Badge>
          <Badge>
            SIGN CURVE:{" "}
            {FlowUtils.getSignatureAlgoName(info.row.original.signAlgo)}
          </Badge>
          <Badge>
            HASH ALGO.: {FlowUtils.getHashAlgoName(info.row.original.hashAlgo)}
          </Badge>
          <Badge>REVOKED: {info.row.original.revoked ? "YES" : "NO"}</Badge>
        </div>
      </div>
    ),
  }),
];

const Details: FunctionComponent = () => {
  const { accountId } = useParams<AccountDetailsRouteParams>();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const { data, isLoading } = useGetAccount(accountId);
  const { data: transactions } = useGetPollingTransactionsByAccount(accountId);
  const { data: contracts } = useGetPollingContractsByAccount(accountId);
  const { data: keys } = useGetPollingKeysByAccount(accountId);
  const { account } = data ?? {};

  const breadcrumbs: Breadcrumb[] = [
    { to: "/accounts", label: "Accounts" },
    { label: "Details" },
  ];

  useEffect(() => {
    showNavigationDrawer(true);
    setBreadcrumbs(breadcrumbs);
  }, []);

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
            content: (
              <Table<DecoratedPollingEntity<Transaction>>
                enableIntroAnimations={enableDetailsIntroAnimation}
                columns={transactionTableColumns}
                data={transactions}
              />
            ),
          },
          {
            id: "contracts",
            label: "Contracts",
            content: (
              <Table<DecoratedPollingEntity<AccountContract>>
                enableIntroAnimations={enableDetailsIntroAnimation}
                columns={columnsContract}
                data={contracts}
              />
            ),
          },
          {
            id: "keys",
            label: "Keys",
            content: (
              <Table<DecoratedPollingEntity<AccountKey>>
                enableIntroAnimations={enableDetailsIntroAnimation}
                columns={columnsKeys}
                data={keys}
              />
            ),
          },
          {
            id: "scripts",
            label: "Scripts",
            content: <ContentDetailsScript script={account.code} />,
          },
        ]}
      />
    </div>
  );
};

export default Details;
