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
import { PublicPrivateStorageCard } from "./PublicPrivateStorageCard";
import { InternalStorageCard } from "./InternalStorageCard";
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
  const { track } = useAnalytics();
  const { accountId } = useParams<AccountDetailsRouteParams>();
  const urlQueryParams = useUrlQuery();
  const focusedStorageId = urlQueryParams.get("focusedStorageId");
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const { data, isLoading } = useGetAccount(accountId);
  const { data: transactions } = useGetPollingTransactionsByAccount(accountId);
  const { data: contracts } = useGetPollingContractsByAccount(accountId);
  const { data: storageItems } = useGetPollingStorageByAccount(accountId);
  const { data: keys } = useGetPollingKeysByAccount(accountId);
  const { account } = data ?? {};
  const [expandedCardIds, setExpandedCardIds] = useState(
    new Set<string>(focusedStorageId ? [focusedStorageId] : [])
  );

  useEffect(() => {
    if (focusedStorageId) {
      expandCardById(focusedStorageId);
      // We need to wait for the virtual nodes to be added to the browser DOM.
      // This is achieved with setTimeout call - wait for the next window paint.
      // There might be a better React way to do this.
      setTimeout(() => {
        const targetDomNode = document.getElementById(focusedStorageId);
        window.scrollTo(0, targetDomNode?.offsetTop ?? 0);
      });
    }
  }, [focusedStorageId, storageItems]);

  const expandCardById = (id: string) => {
    setExpandedCardIds((prev) => new Set(prev.add(id)));
  };

  const minimizeCardById = (id: string) => {
    expandedCardIds.delete(id);
    setExpandedCardIds(new Set(expandedCardIds));
  };

  const toggleCardExpand = (id: string) => {
    if (expandedCardIds.has(id)) {
      track(AnalyticEvent.CLICK_MINIMIZE_STORAGE_CARD, {
        storageId: id,
      });
      minimizeCardById(id);
    } else {
      track(AnalyticEvent.CLICK_EXPAND_STORAGE_CARD, {
        storageId: id,
      });
      expandCardById(id);
    }
  };

  const privateStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_PRIVATE
  );
  const publicStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_PUBLIC
  );
  const internalStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_STORAGE
  );

  const privateAndPublicStorageItems = [
    ...publicStorageItems,
    ...privateStorageItems,
  ];

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
        value: account.address,
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
      <DetailsTabs>
        <DetailsTabItem label="STORAGE" value={storageItems?.length}>
          <div className={classes.grid}>
            {privateAndPublicStorageItems.map((item) => (
              <PublicPrivateStorageCard
                key={item.id}
                enableIntroAnimation={enableDetailsIntroAnimation}
                currentAccountAddress={account.address}
                storageItem={item}
              />
            ))}
          </div>
          <div className={classes.gridExtendable}>
            {internalStorageItems.map((item) => (
              <InternalStorageCard
                key={item.id}
                storageItem={item}
                enableIntroAnimation={enableDetailsIntroAnimation}
                onToggleExpand={() => toggleCardExpand(item.id)}
                isExpanded={expandedCardIds.has(item.id)}
                className={classNames({
                  [classes.gridItemExtended]: expandedCardIds.has(item.id),
                })}
              />
            ))}
          </div>
        </DetailsTabItem>
        <DetailsTabItem label="TRANSACTIONS" value={transactions.length}>
          <Table<DecoratedPollingEntity<Transaction>>
            enableIntroAnimations={enableDetailsIntroAnimation}
            columns={transactionTableColumns}
            data={transactions}
          />
        </DetailsTabItem>
        <DetailsTabItem label="CONTRACTS" value={contracts.length}>
          <Table<DecoratedPollingEntity<AccountContract>>
            enableIntroAnimations={enableDetailsIntroAnimation}
            columns={columnsContract}
            data={contracts}
          />
        </DetailsTabItem>
        <DetailsTabItem label="KEYS" value={keys.length}>
          <Table<DecoratedPollingEntity<AccountKey>>
            enableIntroAnimations={enableDetailsIntroAnimation}
            columns={columnsKeys}
            data={keys}
          />
        </DetailsTabItem>
        {!!account.code && (
          <DetailsTabItem label="SCRIPTS" value="<>">
            <ContentDetailsScript script={account.code} />
          </DetailsTabItem>
        )}
      </DetailsTabs>
    </div>
  );
};

export default Details;
