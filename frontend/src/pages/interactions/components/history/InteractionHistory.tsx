import React, { ReactElement, useMemo } from "react";
import classes from "./InteractionHistory.module.scss";
import {
  useGetPollingBlocks,
  useGetTransactionsByBlock,
} from "../../../../hooks/use-api";
import {
  Timeline,
  TimelineItem,
} from "../../../../components/timeline/Timeline";
import { Block } from "@flowser/shared";
import { useProjectActions } from "../../../../contexts/project.context";
import { FlowserIcon } from "../../../../components/icons/Icons";
import { SizedBox } from "../../../../components/sized-box/SizedBox";
import { Spinner } from "../../../../components/spinner/Spinner";
import { useInteractionRegistry } from "../../contexts/interaction-registry.context";

export function InteractionHistory(): ReactElement {
  const { data: blocks, firstFetch } = useGetPollingBlocks();
  const { checkoutBlock } = useProjectActions();

  const blocksTimeline = useMemo<TimelineItem[]>(
    () =>
      blocks.map((block) => ({
        id: block.id,
        label: (
          <BlockItem block={block} onCheckout={() => checkoutBlock(block.id)} />
        ),
      })),
    [blocks]
  );

  if (firstFetch) {
    return (
      <div className={classes.loadingRoot}>
        <Spinner size={30} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Timeline items={blocksTimeline} />
    </div>
  );
}

type BlockItemProps = {
  block: Block;
  onCheckout: () => void;
};

function BlockItem(props: BlockItemProps) {
  const { block } = props;
  const blockIconSize = 20;
  const checkoutIconSize = blockIconSize * 0.8;

  const { create, setFocused } = useInteractionRegistry();
  const { data } = useGetTransactionsByBlock(block.id, {
    // Assume that every transaction is packaged into a separate block.
    // So once a block exists, no transactions can be appended to it.
    pollingInterval: 0,
  });

  function onForkAsTemplate() {
    const transaction = data[0];
    if (!transaction.proposalKey) {
      throw new Error("Expecting proposalKey");
    }
    create({
      id: block.id,
      name: `Tx #${block.height}`,
      sourceCode: transaction.script,
      fclValuesByIdentifier: new Map(
        transaction.arguments.map((arg) => [
          arg.identifier,
          JSON.parse(arg.valueAsJson),
        ])
      ),
      initialOutcome: {
        transaction: {
          transactionId: transaction.id,
        },
      },
      transactionOptions: {
        proposerAddress: transaction.proposalKey.address,
        payerAddress: transaction.payer,
        authorizerAddresses: transaction.authorizers,
      },
    });
    setFocused(block.id);
  }

  return (
    <div className={classes.blockItem}>
      <div className={classes.info} onClick={onForkAsTemplate}>
        <FlowserIcon.Block width={blockIconSize} height={blockIconSize} />
        <SizedBox width={10} />
        <span>#{String(block.height).padStart(3, "0")}</span>
      </div>
      <div className={classes.actions}>
        <FlowserIcon.CircleArrowLeft
          onClick={props.onCheckout}
          className={classes.checkout}
          width={checkoutIconSize}
          height={checkoutIconSize}
        />
      </div>
    </div>
  );
}
