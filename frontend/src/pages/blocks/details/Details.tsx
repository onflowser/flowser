import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useSearch } from "../../../hooks/use-search";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import Label from "../../../components/label/Label";
import Value from "../../../components/value/Value";
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
import { Transaction } from "@flowser/shared";
import Table from "../../../components/table/Table";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import { ExecutionStatus } from "components/status/ExecutionStatus";
import ReactTimeAgo from "react-timeago";
import {
  DetailsCard,
  DetailsCardColumn,
} from "components/details-card/DetailsCard";
import { TextUtils } from "../../../utils/text-utils";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";

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
          <MiddleEllipsis className={classes.hash}>
            {info.getValue()}
          </MiddleEllipsis>
        </NavLink>
      </Value>
    ),
  }),
  txTableColHelper.accessor("payer", {
    header: () => <Label variant="medium">PAYER</Label>,
    cell: (info) => (
      <Value>
        <NavLink to={`/accounts/details/${info.getValue()}`}>
          <MiddleEllipsis className={classes.hash}>
            {info.getValue()}
          </MiddleEllipsis>
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
  txTableColHelper.accessor("status.grcpStatus", {
    header: () => <Label variant="medium">EXECUTION STATUS</Label>,
    cell: (info) => (
      <div>
        <ExecutionStatus status={info.row.original.status} />
      </div>
    ),
  }),
  txTableColHelper.accessor("status.grcpStatus", {
    header: () => <Label variant="medium">GRCP STATUS</Label>,
    cell: (info) => (
      <div>
        <GrcpStatus status={info.row.original.status} />
      </div>
    ),
  }),
];

const Details: FunctionComponent = () => {
  const { blockId } = useParams<RouteParams>();
  const { updateSearchBar } = useSearch();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const breadcrumbs: Breadcrumb[] = [
    { to: "/blocks", label: "Blocks" },
    { label: "Details" },
  ];

  const { isLoading, data } = useGetBlock(blockId);
  const { block } = data ?? {};
  const { data: transactions } = useGetPollingTransactionsByBlock(blockId);

  useEffect(() => {
    showNavigationDrawer(true);
    setBreadcrumbs(breadcrumbs);
  }, []);

  if (isLoading || !block) {
    return <FullScreenLoading />;
  }

  const detailsColumns: DetailsCardColumn[] = [
    [
      {
        label: "Block ID",
        value: (
          <NavLink to={`/blocks/details/${block.parentId}`}>{block.id}</NavLink>
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
        label: "Timestamp",
        value: TextUtils.longDate(block.createdAt),
      },
      {
        label: "Time",
        value: <ReactTimeAgo date={block.createdAt} />,
      },
    ],
  ];

  return (
    <div className={classes.root}>
      <DetailsCard columns={detailsColumns} />
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
