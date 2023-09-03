import React, { FunctionComponent } from "react";
import classes from "./BlockDetails.module.scss";
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
import { TransactionsTable } from "../../transactions/TransactionsTable/TransactionsTable";
import { ProjectLink } from "../../../components/link/ProjectLink";

type BlockDetailsProps = {
  blockId: string;
};

export const BlockDetails: FunctionComponent<BlockDetailsProps> = (props) => {
  const { isLoading, data } = useGetBlock(props.blockId);
  const { block } = data ?? {};
  const { data: transactions } = useGetTransactionsByBlock(props.blockId);

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
