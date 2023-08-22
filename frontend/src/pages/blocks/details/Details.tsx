import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import Label from "@flowser/uimisc/Label/Label";
import Value from "@flowser/uimisc/Value/Value";
import classes from "./Details.module.scss";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetBlock, useGetTransactionsByBlock } from "../../../hooks/use-api";
import { FlowUtils } from "../../../utils/flow-utils";
import { createColumnHelper } from "@tanstack/table-core";
import { Transaction } from "@flowser/shared";
import Table from "../../../components/table/Table";
import MiddleEllipsis from "../../../components/ellipsis/MiddleEllipsis";
import { ExecutionStatus } from "components/status/ExecutionStatus";
import { TableCard, DetailsCardColumn } from "components/cards/table/TableCard";
import { TextUtils } from "../../../utils/text-utils";
import { GrcpStatus } from "../../../components/status/GrcpStatus";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import { enableDetailsIntroAnimation } from "../../../config/common";
import { SizedBox } from "@flowser/uimisc/SizedBox";
import { AccountLink } from "@flowser/ui";
import { StyledTabs } from "@flowser/ui/tabs/StyledTabs";

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
        <AccountLink address={info.getValue()} />
      </Value>
    ),
  }),
  txTableColHelper.accessor("proposalKey", {
    header: () => <Label variant="medium">PROPOSER</Label>,
    cell: (info) => (
      <Value>
        {info.row.original.proposalKey ? (
          <AccountLink address={info.row.original.proposalKey.address} />
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
    header: () => <Label variant="medium">API STATUS</Label>,
    cell: (info) => (
      <div>
        <GrcpStatus status={info.row.original.status} />
      </div>
    ),
  }),
];

const Details: FunctionComponent = () => {
  const { blockId } = useParams<RouteParams>();
  const { setBreadcrumbs } = useNavigation();
  const { showNavigationDrawer } = useNavigation();
  const breadcrumbs: Breadcrumb[] = [
    { to: "/blocks", label: "Blocks" },
    { label: "Details" },
  ];

  const { isLoading, data } = useGetBlock(blockId);
  const { block } = data ?? {};
  const { data: transactions } = useGetTransactionsByBlock(blockId);

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
        label: "Height",
        value: String(block.height),
      },
      {
        label: "Block ID",
        value: block.id,
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
        label: "Collections",
        value: String(block.collectionGuarantees?.length ?? 0),
      },
      {
        label: "Created date",
        value: TextUtils.longDate(block.createdAt),
      },
    ],
  ];

  return (
    <div className={classes.root}>
      <TableCard columns={detailsColumns} />
      <SizedBox height={30} />
      <StyledTabs
        tabs={[
          {
            id: "transactions",
            label: "Transactions",
            content: (
              <Table<DecoratedPollingEntity<Transaction>>
                data={transactions}
                columns={txTableColumns}
                enableIntroAnimations={enableDetailsIntroAnimation}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Details;
