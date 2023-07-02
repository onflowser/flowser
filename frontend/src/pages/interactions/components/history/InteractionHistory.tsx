import React, { ReactElement, useMemo } from "react";
import classes from "./InteractionHistory.module.scss";
import { useGetPollingBlocks } from "../../../../hooks/use-api";
import {
  Timeline,
  TimelineItem,
} from "../../../../components/timeline/Timeline";
import { Block } from "@flowser/shared";
import { useProjectActions } from "../../../../contexts/project.context";

export function InteractionHistory(): ReactElement {
  const { data: blocks } = useGetPollingBlocks();
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
  return (
    <div onClick={props.onCheckout}>
      <code>#{block.height}</code>
    </div>
  );
}
