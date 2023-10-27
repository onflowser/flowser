import React, { FunctionComponent } from "react";
import classes from "./BlockDetails.module.scss";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import { FlowUtils } from "../../utils/flow-utils";
import {
  DetailsCard,
  DetailsCardColumn,
} from "../../common/cards/DetailsCard/DetailsCard";
import { SizedBox } from "../../common/misc/SizedBox/SizedBox";
import { StyledTabs } from "../../common/tabs/StyledTabs/StyledTabs";
import { TransactionsTable } from "../../transactions/TransactionsTable/TransactionsTable";
import { ProjectLink } from "../../common/links/ProjectLink";
import { DateDisplay } from "../../common/time/DateDisplay/DateDisplay";
import { useGetBlock, useGetTransactionsByBlock } from "../../api";

type BlockDetailsProps = {
  blockId: string;
};

export const BlockDetails: FunctionComponent<BlockDetailsProps> = (props) => {
  const { isLoading, data: block } = useGetBlock(props.blockId);
  const { data: transactions } = useGetTransactionsByBlock(props.blockId);

  if (isLoading || !block || !transactions) {
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
          <ProjectLink to={`/blocks/${block.parentId}`}>
            {block.parentId}
          </ProjectLink>
        ),
      },
      {
        label: "Collections",
        value: String(block.collectionGuarantees?.length ?? 0),
      },
      {
        label: "Created date",
        value: <DateDisplay date={block.createdAt} />,
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
