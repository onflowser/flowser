import React, { ReactElement } from "react";
import classes from "./InteractionHistory.module.scss";
import {
  useGetPollingBlocks,
  useGetTransactionsByBlock,
} from "../../../../hooks/use-api";
import { Block, Transaction } from "@flowser/shared";
import { FlowserIcon } from "../../../../components/icons/FlowserIcon";
import { SizedBox } from "../../../../components/misc/SizedBox/SizedBox";
import { Spinner } from "../../../../components/loaders/Spinner/Spinner";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import { useTransactionName } from "../../hooks/use-transaction-name";
import { MenuItem } from "@szhsin/react-menu";
import { FlowserMenu } from "../../../../components/overlays/menus/Menu";
import { GrcpStatusIcon } from "../../../../components/status/GrcpStatus";
import { useSnapshotsManager } from "../../../../contexts/snapshots.context";

export function InteractionHistory(): ReactElement {
  const { data: blocks } = useGetPollingBlocks();

  // There should always be at least one (initial) block.
  if (blocks.length === 0) {
    return (
      <div className={classes.loadingRoot}>
        <Spinner size={30} />
      </div>
    );
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
  block: Block;
};

function BlockItem(props: BlockItemProps) {
  const { block } = props;
  const menuIconSize = 15;

  const { checkoutBlock } = useSnapshotsManager();
  const { create, setFocused } = useInteractionRegistry();
  const { data } = useGetTransactionsByBlock(block.id, {
    // Assume that every transaction is packaged into a separate block.
    // So once a block exists, no transactions can be appended to it.
    pollingInterval: 0,
  });
  const firstTransaction = data[0];

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
        firstTransaction.arguments.map((arg) => [
          arg.identifier,
          JSON.parse(arg.valueAsJson),
        ])
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
      <MenuItem onClick={() => checkoutBlock(block.id)}>
        <FlowserIcon.CircleArrowLeft
          width={menuIconSize}
          height={menuIconSize}
        />
        <SizedBox width={10} />
        Rollback to block
      </MenuItem>
    </FlowserMenu>
  );
}

type BlockItemContentProps = {
  block: Block;
  transaction: Transaction | undefined;
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
