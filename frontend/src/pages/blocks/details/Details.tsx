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
import { createColumnHelper } from "@tanstack/table-core";
import { DecoratedPollingEntity } from "../../../hooks/use-timeout-polling";
import { Transaction } from "@flowser/shared";
import Table from "../../../components/table/Table";
import Ellipsis from "../../../components/ellipsis/Ellipsis";
import { ExecutionStatus } from "components/status/ExecutionStatus";
import { useFormattedDate } from "hooks/use-formatted-date";
import ReactTimeAgo from "react-timeago";
import {
  DetailsCard,
  DetailsCardProps,
} from "components/details-card/DetailsCard";

type RouteParams = {
  blockId: string;
};

const txTableColHelper =
  createColumnHelper<DecoratedPollingEntity<Transaction>>();

const txTableColumns = [
  txTableColHelper.accessor("id", {
    header: () => <Label variant="medium">TRANSACTION ID</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/transactions/details/${info.getValue()}`}>
          <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
        </NavLink>
      </Value>
    ),
  }),
  txTableColHelper.accessor("payer", {
    header: () => <Label variant="medium">PAYER</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          <Ellipsis className={classes.hash}>{info.getValue()}</Ellipsis>
        </NavLink>
      </Value>
    ),
  }),
  txTableColHelper.accessor("proposalKey", {
    header: () => <Label variant="medium">PROPOSER</Label>,
    cell: (info) => (
      <Value>
        {info.getValue() ? (
          <NavLink
            to={`/accounts/details/${info.row.original.proposalKey?.address}`}
          >
            {info.row.original.proposalKey?.address}
          </NavLink>
        ) : (
          "-"
        )}
      </Value>
    ),
  }),
  txTableColHelper.accessor("status", {
    header: () => <Label variant="medium">STATUS</Label>,
    cell: (info) => (
      <div>
        <Value>
          <ExecutionStatus status={info.getValue()} />
        </Value>
      </div>
    ),
  }),
];

const Details: FunctionComponent = () => {
  const { blockId } = useParams<RouteParams>();
  const { disableSearchBar, updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const breadcrumbs: Breadcrumb[] = [
    { to: "/blocks", label: "Blocks" },
    { label: "Details" },
  ];

  const { isLoading, data } = useGetBlock(blockId);
  const { block } = data ?? {};
  const { data: transactions } = useGetPollingTransactionsByBlock(blockId);
  const createdDate = block ? new Date(block.timestamp).toISOString() : "-";
  const { formatDate } = useFormattedDate();

  useEffect(() => {
    showNavigationDrawer(true);
    setBreadcrumbs(breadcrumbs);
    disableSearchBar(true);
  }, []);

  if (isLoading || !block) {
    return <FullScreenLoading />;
  }

  const detailsColumns: DetailsCardProps = {
    columns: [
      [
        {
          label: "Block ID",
          value: (
            <NavLink to={`/blocks/details/${block.parentId}`}>
              {block.id}
            </NavLink>
          ),
        },
        {
          label: "Parent ID",
          value: FlowUtils.isInitialBlockId(block.parentId) ? (
            block.parentId
          ) : (
            <NavLink to={`/blocks/details/${block.parentId}`}>
              {block.parentId}
            </NavLink>
          ),
        },
        {
          label: "Time Stamp",
          value: formatDate(createdDate),
        },
        {
          label: "Time",
          value: <ReactTimeAgo date={createdDate} />,
        },
      ],
    ],
  };

  return (
    <div className={classes.root}>
      <DetailsCard columns={detailsColumns.columns} />
      <DetailsTabs>
        <DetailsTabItem label="HEIGHT" value={block.height} />
        <DetailsTabItem label="TRANSACTIONS" value={transactions.length}>
          <Fragment
            onMount={() =>
              updateSearchBar("search for transactions", !transactions.length)
            }
          >
            {transactions && (
              <Table<DecoratedPollingEntity<Transaction>>
                data={transactions}
                columns={txTableColumns}
              />
            )}
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
