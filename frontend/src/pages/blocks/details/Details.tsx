import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useSearch } from "../../../hooks/use-search";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
import CopyButton from "../../../components/copy-button/CopyButton";
import Card from "../../../components/card/Card";
import TimeAgo from "../../../components/time-ago/TimeAgo";
import DateWithCalendar from "../../../components/date-with-calendar/DateWithCalendar";
import classes from "./Details.module.scss";
import {
  DetailsTabItem,
  DetailsTabs,
} from "../../../components/details-tabs/DetailsTabs";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import Fragment from "../../../components/fragment/Fragment";
import {
  useGetBlock,
  useGetPollingTransactionsByBlock,
} from "../../../hooks/use-api";
import { FlowUtils } from "../../../utils/flow-utils";

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
            {FlowUtils.isInitialBlockId(block.parentId) ? (
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
