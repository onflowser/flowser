import React, { FunctionComponent, useEffect, useState } from "react";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import { useSearch } from "../../../hooks/use-search";
import classes from "./Details.module.scss";
import Value from "../../../components/value/Value";
import Card from "../../../components/card/Card";
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
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import {
  AccountContract,
  AccountKey,
  AccountStorageDomain,
} from "@flowser/shared";
import { FlowUtils } from "../../../utils/flow-utils";
import Table from "../../../components/table/Table";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import Badge from "../../../components/badge/Badge";
import { PublicPrivateStorageCard } from "./PublicPrivateStorageCard";
import { BaseStorageCard } from "./BaseStorageCard";
import classNames from "classnames";
import { useUrlQuery } from "../../../hooks/use-url-query";

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
          <Ellipsis className={classes.hash}>
            {info.row.original.publicKey}
          </Ellipsis>
          <CopyButton value={info.row.original.publicKey} />
        </div>
        <div className={`${classes.badges} ${classes.row}`}>
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
  const urlQueryParams = useUrlQuery();
  const focusedStorageId = urlQueryParams.get("focusedStorageId");
  const { updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, isLoading } = useGetAccount(accountId);
  // TODO(milestone-5): Should we show all transactions of account?
  const { data: transactions } = useGetPollingTransactionsByAccount(accountId);
  const { data: contracts } = useGetPollingContractsByAccount(accountId);
  const { data: storageItems } = useGetPollingStorageByAccount(accountId);
  console.log({ storageItems });
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
      minimizeCardById(id);
    } else {
      expandCardById(id);
    }
  };

  const privateStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_PRIVATE
  );
  const publicStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_PUBLIC
  );
  const baseStorageItems = storageItems.filter(
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
    showSubNavigation(false);
    setBreadcrumbs(breadcrumbs);
  }, []);

  if (isLoading || !account) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.firstRow}>
        <Label variant="large">ADDRESS</Label>
        <Value variant="large">{account.address}</Value>
        <CopyButton value={account.address} />
      </div>
      <Card className={classes.bigCard}>
        <div>
          <Label variant="large" className={classes.label}>
            BALANCE
          </Label>
          <Value variant="large">{account.balance} FLOW</Value>
        </div>
      </Card>
      <DetailsTabs>
        <DetailsTabItem label="STORAGE" value={account.storage?.length}>
          <div className={classes.grid}>
            {privateAndPublicStorageItems.map((item) => (
              <PublicPrivateStorageCard key={item.id} content={item} />
            ))}
          </div>
          <div className={classes.gridExtendable}>
            {baseStorageItems.map((item) => (
              <BaseStorageCard
                key={item.id}
                content={item}
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
          label="CONTRACTS"
          value={contracts.length}
          onClick={() =>
            updateSearchBar("search for contracts", !contracts.length)
          }
        >
          <Table<DecoratedPollingEntity<AccountContract>>
            columns={columnsContract}
            data={contracts}
          />
        </DetailsTabItem>
        <DetailsTabItem label="KEYS" value={keys.length}>
          <Fragment
            onMount={() => updateSearchBar("search for keys", !keys.length)}
          >
            <Table<DecoratedPollingEntity<AccountKey>>
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

export default Details;
