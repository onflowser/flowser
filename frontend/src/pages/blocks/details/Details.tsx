import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useSearch } from "../../../shared/hooks/search";
import { Breadcrumb, useNavigation } from "../../../shared/hooks/navigation";
import Label from "../../../shared/components/label/Label";
import Value from "../../../shared/components/value/Value";
import CopyButton from "../../../shared/components/copy-button/CopyButton";
import Card from "../../../shared/components/card/Card";
import TimeAgo from "../../../shared/components/time-ago/TimeAgo";
import DateWithCalendar from "../../../shared/components/date-with-calendar/DateWithCalendar";
import classes from "./Details.module.scss";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../shared/components/details-tabs/DetailsTabs";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import { isInitialParentId } from "../../../shared/functions/utils";
import Fragment from "../../../shared/components/fragment/Fragment";
import {
  useGetBlock,
  useGetPollingTransactionsByBlock,
} from "../../../shared/hooks/api";

type RouteParams = {
  blockId: string;
};

const Details: FunctionComponent = () => {
  const { blockId } = useParams<RouteParams>();
  const { disableSearchBar, updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer, showSubNavigation } = useNavigation();
  const breadcrumbs: Breadcrumb[] = [
    { to: "/blocks", label: "Blocks" },
    { label: "Details" },
  ];

  const { isLoading, data } = useGetBlock(blockId);
  const { block } = data ?? {};
  const { data: transactions } = useGetPollingTransactionsByBlock(blockId);
  const createdDate = block ? new Date(block.timestamp).toISOString() : "-";

  useEffect(() => {
    showNavigationDrawer(true);
    showSubNavigation(false);
    setBreadcrumbs(breadcrumbs);
    disableSearchBar(true);
  }, []);

  if (isLoading || !block) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.firstRow}>
        <Label variant="large">BLOCK ID</Label>
        <Value variant="large">{block.id}</Value>
        <CopyButton value={block.id} />
      </div>
      <Card className={classes.bigCard}>
        <div>
          <Label variant="large" className={classes.label}>
            PARENT ID
          </Label>
          <Value variant="large">
            {isInitialParentId(block.parentId) ? (
              block.parentId
            ) : (
              <NavLink to={`/blocks/details/${block.parentId}`}>
                {block.parentId}
              </NavLink>
            )}
          </Value>
        </div>
        <div className={classes.dateAndTimeAgo}>
          <TimeAgo date={createdDate} />
          <DateWithCalendar date={createdDate} />
        </div>
      </Card>

      <DetailsTabs>
        <DetailsTabItem label="HEIGHT" value={block.height} />
        <DetailsTabItem label="TRANSACTIONS" value={transactions.length}>
          <Fragment
            onMount={() =>
              updateSearchBar("search for transactions", !transactions.length)
            }
          >
            {transactions &&
              transactions.map((transaction, index) => (
                <Card
                  variant="black"
                  key={index}
                  className={classes.transactionListItem}
                >
                  <Label>TRANSACTION ID</Label>
                  <Value>
                    <NavLink to={`/transactions/details/${transaction.id}`}>
                      {transaction.id}
                    </NavLink>
                  </Value>
                </Card>
              ))}
          </Fragment>
        </DetailsTabItem>

        <DetailsTabItem
          label="COLLECTIONS"
          value={block.collectionGuarantees?.length ?? 0}
        />
      </DetailsTabs>
    </div>
  );
};

export default Details;
