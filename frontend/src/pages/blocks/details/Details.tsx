import React, { FunctionComponent, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Breadcrumb, useNavigation } from "../../../hooks/use-navigation";
import classes from "./Details.module.scss";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { useGetBlock, useGetTransactionsByBlock } from "../../../hooks/use-api";
import { FlowUtils } from "../../../utils/flow-utils";
import {
  DetailsCard,
  DetailsCardColumn,
} from "components/details-card/DetailsCard";
import { TextUtils } from "../../../utils/text-utils";
import { SizedBox } from "../../../components/sized-box/SizedBox";
import { StyledTabs } from "../../../components/tabs/StyledTabs";
import { TransactionsTable } from "../../transactions/main/TransactionsTable";

type RouteParams = {
  blockId: string;
};

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
      <DetailsCard columns={detailsColumns} />
      <SizedBox height={30} />
      <StyledTabs
        tabs={[
          {
            id: "transactions",
            label: "Transactions",
            content: <TransactionsTable transactions={transactions} />,
          },
        ]}
      />
    </div>
  );
};

export default Details;
