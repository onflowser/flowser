import React, { ReactElement } from "react";
import classes from "./InteractionHistory.module.scss";
import {
  useGetPollingBlocks,
  useGetTransactionsByBlock,
} from "../../../../hooks/use-api";
import { Block } from "@flowser/shared";
import { useProjectActions } from "../../../../contexts/project.context";
import { FlowserIcon } from "../../../../components/icons/Icons";
import { SizedBox } from "../../../../components/sized-box/SizedBox";
import { Spinner } from "../../../../components/spinner/Spinner";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";
import { useTransactionName } from "../../hooks/use-transaction-name";
import { MenuItem } from "@szhsin/react-menu";
import { FlowserMenu } from "../../../../components/menus/Menu";

export function InteractionHistory(): ReactElement {
  const { data: blocks, firstFetch } = useGetPollingBlocks();

  if (firstFetch) {
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
  const blockIconSize = 20;
  const menuIconSize = blockIconSize * 0.8;

  const { checkoutBlock } = useProjectActions();
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
    create({
      id: block.id,
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
    setFocused(block.id);
  }

  return (
    <FlowserMenu
      position="anchor"
      align="center"
      direction="right"
      menuButton={
        <div className={classes.blockItem}>
          <div className={classes.info}>
            <FlowserIcon.Block
              className={classes.icon}
              width={blockIconSize}
              height={blockIconSize}
            />
            <SizedBox width={10} />
            <span>#{String(block.height).padStart(3, "0")}</span>
            {firstTransaction && (
              <>
                <SizedBox width={10} />
                <FlowserIcon.Transaction className={classes.icon} width={12} />
                <SizedBox width={10} />
                <span className={classes.transactionName}>
                  {transactionName ?? "Unknown"}
                </span>
              </>
            )}
          </div>
          <div className={classes.actions}>
            <FlowserIcon.CircleArrowLeft
              className={classes.checkout}
              width={menuIconSize}
              height={menuIconSize}
            />
          </div>
        </div>
      }
    >
      <MenuItem onClick={() => onForkAsTemplate()}>
        <FlowserIcon.Share width={menuIconSize} height={menuIconSize} />
        <SizedBox width={10} />
        Open
      </MenuItem>
      <MenuItem onClick={() => checkoutBlock(block.id)}>
        <FlowserIcon.CircleArrowLeft
          width={menuIconSize}
          height={menuIconSize}
        />
        <SizedBox width={10} />
        Rollback
      </MenuItem>
    </FlowserMenu>
  );
}
