import React, { FunctionComponent, useEffect, useState } from "react";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import { useSearch } from "../../../hooks/use-search";
import classes from "./Details.module.scss";
import Value from "../../../components/value/Value";
import Label from "../../../components/label/Label";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import CopyButton from "../../../components/copy-button/CopyButton";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import { NavLink, useParams } from "react-router-dom";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import Fragment from "../../../components/fragment/Fragment";
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
import Card from "../../../components/card/Card";
import { ActionButton } from "../../../components/action-button/ActionButton";
import { ReactComponent as LogoutIcon } from "../../../assets/icons/logout.svg";
import { ReactComponent as SendTxIcon } from "../../../assets/icons/send-tx.svg";
import { useFlow } from "../../../hooks/use-flow";
import { useProjectActions } from "../../../contexts/project.context";
import { UserIcon } from "../../../components/user-icon/UserIcon";
// @ts-ignore .png import error
import gradient from "../../../assets/images/gradient.png";
import { useAnalytics } from "../../../hooks/use-analytics";
import { AnalyticEvent } from "../../../services/analytics.service";
import { TextUtils } from "../../../utils/text-utils";
import { transactionTableColumns } from "../../transactions/main/Main";
import { enableDetailsIntroAnimation } from "../../../config/common";

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
  const { updateSearchBar } = useSearch();
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
      // This is achieved with setTimeout call - wait for the next window pain.
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
        <ProfileActionsCard currentAddress={accountId} />
      </div>
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
        <DetailsTabItem
          label="TRANSACTIONS"
          value={transactions.length}
          onClick={() =>
            updateSearchBar("search for transactions", !transactions.length)
          }
        >
          <Table<DecoratedPollingEntity<Transaction>>
            enableIntroAnimations={enableDetailsIntroAnimation}
            columns={transactionTableColumns}
            data={transactions}
          />
        </DetailsTabItem>
        <DetailsTabItem
          label="CONTRACTS"
          value={contracts.length}
          onClick={() =>
            updateSearchBar("search for contracts", !contracts.length)
          }
        >
          <Table<DecoratedPollingEntity<AccountContract>>
            enableIntroAnimations={enableDetailsIntroAnimation}
            columns={columnsContract}
            data={contracts}
          />
        </DetailsTabItem>
        <DetailsTabItem label="KEYS" value={keys.length}>
          <Fragment
            onMount={() => updateSearchBar("search for keys", !keys.length)}
          >
            <Table<DecoratedPollingEntity<AccountKey>>
              enableIntroAnimations={enableDetailsIntroAnimation}
              columns={columnsKeys}
              data={keys}
            />
          </Fragment>
        </DetailsTabItem>
        {!!account.code && (
          <DetailsTabItem label="SCRIPTS" value="<>">
            <Fragment
              onMount={() => updateSearchBar("search for scripts", true)}
            >
              <ContentDetailsScript script={account.code} />
            </Fragment>
          </DetailsTabItem>
        )}
      </DetailsTabs>
    </div>
  );
};

function ProfileActionsCard({ currentAddress }: { currentAddress: string }) {
  const { logout, user, isLoggedIn } = useFlow();
  const { sendTransaction } = useProjectActions();

  if (!isLoggedIn || currentAddress !== user.addr) {
    return null;
  }
  return (
    <Card className={classes.actionCard}>
      <img className={classes.background} src={gradient} alt="" />
      <div className={classes.avatarWrapper}>
        <UserIcon size={50} />
      </div>
      <div className={classes.actionsWrapper}>
        <ActionButton
          onClick={() => sendTransaction()}
          title="Send transaction"
          icon={<SendTxIcon />}
        />
        <ActionButton
          onClick={logout}
          title="Disconnect wallet"
          icon={<LogoutIcon />}
        />
      </div>
    </Card>
  );
}

export default Details;
