import React, { FunctionComponent, useEffect } from "react";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import { useSearch } from "../../../hooks/use-search";
import classes from "./Details.module.scss";
import Value from "../../../components/value/Value";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import KeyListItem from "./KeyListItem";
import CopyButton from "../../../components/copy-button/CopyButton";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import CollapsibleCard from "../../../components/collapsible-card/CollapsibleCard";
import { useParams } from "react-router-dom";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import TransactionListItem from "../../../components/transaction-list-item/TransactionListItem";
import Fragment from "../../../components/fragment/Fragment";
import {
  useGetAccount,
  useGetPollingContractsByAccount,
  useGetPollingKeysByAccount,
  useGetPollingStorageByAccount,
  useGetPollingTransactionsByAccount,
} from "../../../hooks/use-api";
import StorageItem from "./StorageItem";

type RouteParams = {
  accountId: string;
};

const Details: FunctionComponent = () => {
  const { accountId } = useParams<RouteParams>();
  const { updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, isLoading } = useGetAccount(accountId);
  const { data: transactions } = useGetPollingTransactionsByAccount(accountId);
  const { data: contracts } = useGetPollingContractsByAccount(accountId);
  const { data: storageItems } = useGetPollingStorageByAccount(accountId);
  const { data: keys } = useGetPollingKeysByAccount(accountId);
  const { account } = data ?? {};

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
          {/* TODO(milestone-3): display account storage*/}
          {/* <Storage data={account.storage} />} */}
          {storageItems.map((item) => (
            <StorageItem key={item.id} storageItem={item} />
          ))}
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
        <DetailsTabItem
          label="TRANSACTIONS"
          value={account.transactions.length}
        >
          <Fragment
            onMount={() =>
              updateSearchBar("search for transactions", !transactions.length)
            }
          >
            {transactions.map((item) => (
              <TransactionListItem key={item.id} transaction={item} />
            ))}
          </Fragment>
        </DetailsTabItem>
        <DetailsTabItem
          label="CONTRACTS"
          value={contracts.length}
          onClick={() =>
            updateSearchBar("search for contracts", !contracts.length)
          }
        >
          {contracts.map((contract) => (
            <CollapsibleCard
              key={contract.id}
              showIntroAnimation={contract.isNew || contract.isUpdated}
              header="CONTRACT NAME"
              subheader={contract.name}
              variant="black"
              className={classes.script}
            >
              <Fragment
                onMount={() =>
                  updateSearchBar("search for contracts", !contracts.length)
                }
              >
                <ContentDetailsScript script={contract.code} />
              </Fragment>
            </CollapsibleCard>
          ))}
        </DetailsTabItem>
        <DetailsTabItem label="KEYS" value={keys.length}>
          <Fragment
            onMount={() => updateSearchBar("search for keys", !keys.length)}
          >
            {keys.map((key) => (
              <KeyListItem key={key.index} accountKey={key} />
            ))}
          </Fragment>
        </DetailsTabItem>
      </DetailsTabs>
    </div>
  );
};

export default Details;
