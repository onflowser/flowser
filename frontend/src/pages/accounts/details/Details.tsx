import React, { FunctionComponent, useEffect } from "react";
import { Breadcrumb, useNavigation } from "../../../shared/hooks/navigation";
import { useSearch } from "../../../shared/hooks/search";
import classes from "./Details.module.scss";
import Value from "../../../shared/components/value/Value";
import Card from "../../../shared/components/card/Card";
import Storage from "./Storage";
import Label from "../../../shared/components/label/Label";
import ContentDetailsScript from "../../../shared/components/content-details-script/ContentDetailsScript";
import ContentDetailsKeys from "./ContentDetailsKeys";
import CopyButton from "../../../shared/components/copy-button/CopyButton";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../shared/components/details-tabs/DetailsTabs";
import CollapsibleCard from "../../../shared/components/collapsible-card/CollapsibleCard";
import { useParams } from "react-router-dom";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import TransactionListItem from "../../../shared/components/transaction-list-item/TransactionListItem";
import Fragment from "../../../shared/components/fragment/Fragment";
import { useGetAccount } from "../../../shared/hooks/api";

type RouteParams = {
  accountId: string;
};

const Details: FunctionComponent = () => {
  const { accountId } = useParams<RouteParams>();
  const { updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const { data, isLoading } = useGetAccount(accountId);
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
          {account.storage?.length && <Storage data={account.storage} />}
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
        {!!account.transactions && (
          <DetailsTabItem
            label="TRANSACTIONS"
            value={account.transactions.length}
          >
            <Fragment
              onMount={() =>
                updateSearchBar(
                  "search for transactions",
                  !account.transactions.length
                )
              }
            >
              {account.transactions.map((item: any, i: number) => (
                <TransactionListItem
                  key={i}
                  id={item.id}
                  referenceBlockId={item.referenceBlockId}
                  statusCode={item.status.statusCode}
                  payer={item.payer}
                  proposer={item.proposalKey.address}
                />
              ))}
            </Fragment>
          </DetailsTabItem>
        )}
        <DetailsTabItem
          label="CONTRACTS"
          value={account.contracts.length}
          onClick={() =>
            updateSearchBar("search for contracts", !account.contracts.length)
          }
        >
          {account.contracts.map((contract: any, index: number) => (
            <CollapsibleCard
              key={index}
              isNew={contract.isNew}
              header="CONTRACT NAME"
              subheader={contract.name}
              variant="black"
              className={classes.script}
            >
              <Fragment
                onMount={() =>
                  updateSearchBar(
                    "search for contracts",
                    !account.contracts.length
                  )
                }
              >
                <ContentDetailsScript script={contract.code} />
              </Fragment>
            </CollapsibleCard>
          ))}
        </DetailsTabItem>
        <DetailsTabItem label="KEYS" value={account.keys.length}>
          <Fragment
            onMount={() =>
              updateSearchBar("search for keys", !account.keys.length)
            }
          >
            <ContentDetailsKeys keys={account.keys} />
          </Fragment>
        </DetailsTabItem>
      </DetailsTabs>
    </div>
  );
};

export default Details;
