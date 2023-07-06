import React, { ReactElement, useMemo } from "react";
import classes from "./InteractionHistory.module.scss";
import { useGetPollingBlocks } from "../../../../hooks/use-api";
import {
  Timeline,
  TimelineItem,
} from "../../../../components/timeline/Timeline";
import { Block } from "@flowser/shared";
import { useProjectActions } from "../../../../contexts/project.context";
import { FlowserIcon } from "../../../../components/icons/Icons";
import { SizedBox } from "../../../../components/sized-box/SizedBox";
import { Spinner } from "../../../../components/spinner/Spinner";

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
  return (
    <div className={classes.blockItem}>
      <div className={classes.info}>
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
