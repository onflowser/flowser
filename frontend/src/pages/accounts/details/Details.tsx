import React, { FunctionComponent, useEffect } from "react";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import { useSearch } from "../../../hooks/use-search";
import classes from "./Details.module.scss";
import Value from "../../../components/value/Value";
import Card from "../../../components/card/Card";
import Storage from "./Storage";
import Label from "../../../components/label/Label";
import ContentDetailsScript from "../../../components/content-details-script/ContentDetailsScript";
import ContentDetailsKeys from "./ContentDetailsKeys";
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
import { useGetAccount } from "../../../hooks/use-api";

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
              {/* TODO(milestone-2): get data from transaction polling endpoint */}
              {account.transactions.map((item, i: number) => (
                <TransactionListItem
                  key={i}
                  id={item.id}
                  referenceBlockId={item.referenceBlockId}
                  statusCode={item.status?.status}
                  payer={item.payer}
                  proposer={item.proposalKey?.address ?? "-"}
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
