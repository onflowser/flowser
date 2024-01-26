import React, { ReactElement } from "react";
import classes from "./InteractionHistory.module.scss";
import { FlowserIcon } from "../../../common/icons/FlowserIcon";
import { SizedBox } from "../../../common/misc/SizedBox/SizedBox";
import { Spinner } from "../../../common/loaders/Spinner/Spinner";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import { useTransactionName } from "../../hooks/use-transaction-name";
import { MenuItem } from "@szhsin/react-menu";
import { FlowserMenu } from "../../../common/overlays/Menu/Menu";
import { GrcpStatusIcon } from "../../../common/status/GrcpStatus";
import {
  useOptionalSnapshotsManager,
} from "../../../contexts/snapshots.context";
import { FlowBlock, FlowTransaction } from "@onflowser/api";
import { useGetBlocks, useGetTransactionsByBlock } from "../../../api";

export function InteractionHistory(): ReactElement {
  const { data: blocks, error } = useGetBlocks();

  if (error) {
    return (
      <div className={classes.loadingRoot}>
        Error: {error}
      </div>
    )
  }

  if (!blocks) {
    return (
      <div className={classes.loadingRoot}>
        <Spinner size={30} />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className={classes.loadingRoot}>
        Empty history
      </div>
    )
  }

  return (
    <div>
      {blocks.map((block) => (
        <BlockItem key={block.id} block={block} />
      ))}
    </div>
  );
}

type BlockItemProps = {
  block: FlowBlock;
};

function BlockItem(props: BlockItemProps) {
  const { block } = props;
  const menuIconSize = 15;

  const snapshotsManager = useOptionalSnapshotsManager();
  const { create, setFocused } = useInteractionRegistry();
  const { data } = useGetTransactionsByBlock(block.id);
  const firstTransaction = data?.[0];

  const transactionName = useTransactionName({
    transaction: firstTransaction,
  });

  function onForkAsTemplate() {
    if (!firstTransaction?.proposalKey) {
      return;
    }
    const createdInteraction = create({
      name: transactionName ?? `Tx from block #${block.height}`,
      code: firstTransaction.script,
      fclValuesByIdentifier: new Map(
        firstTransaction.arguments.map((arg) => [arg.identifier, arg.value]),
      ),
      initialOutcome: {
        transaction: {
          transactionId: firstTransaction.id,
        },
      },
      transactionOptions: {
        proposerAddress: firstTransaction.proposalKey.address,
        payerAddress: firstTransaction.payer,
        authorizerAddresses: firstTransaction.authorizers,
      },
    });
    setFocused(createdInteraction.id);
  }

  return (
    <FlowserMenu
      position="anchor"
      align="center"
      direction="right"
      menuButton={
        <div style={{ pointerEvents: firstTransaction ? "all" : "none" }}>
          <BlockItemContent block={block} transaction={firstTransaction} />
        </div>
      }
    >
      <MenuItem onClick={() => onForkAsTemplate()}>
        <FlowserIcon.Share width={menuIconSize} height={menuIconSize} />
        <SizedBox width={10} />
        View transaction
      </MenuItem>
      {snapshotsManager && (
        <MenuItem onClick={() => snapshotsManager.checkoutBlock(block.id)}>
          <FlowserIcon.CircleArrowLeft
            width={menuIconSize}
            height={menuIconSize}
          />
          <SizedBox width={10} />
          Rollback to block
        </MenuItem>
      )}
    </FlowserMenu>
  );
}

type BlockItemContentProps = {
  block: FlowBlock;
  transaction: FlowTransaction | undefined;
};

function BlockItemContent(props: BlockItemContentProps) {
  const { block, transaction } = props;
  const blockIconSize = 20;

  const transactionName = useTransactionName({
    transaction,
  });

  return (
    <div className={classes.blockItem}>
      <div className={classes.info}>
        <FlowserIcon.Block
          className={classes.icon}
          width={blockIconSize}
          height={blockIconSize}
        />
        <SizedBox width={10} />
        <span>#{String(block.height).padStart(3, "0")}</span>
        <SizedBox width={10} />
        {transaction && (
          <span className={classes.transactionName}>
            {transactionName ?? "Unknown"}
          </span>
        )}
      </div>
      <div className={classes.actions}>
        {transaction?.status && (
          <GrcpStatusIcon
            size={15}
            statusCode={transaction.status.grcpStatus}
          />
        )}
      </div>
    </div>
  );
}
