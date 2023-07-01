import React, { ReactElement, useMemo } from "react";
import classes from "./InteractionHistory.module.scss";
import { useGetPollingBlocks } from "../../../../hooks/use-api";
import {
  Timeline,
  TimelineItem,
} from "../../../../components/timeline/Timeline";
import { Block } from "@flowser/shared";

export function InteractionHistory(): ReactElement {
  const { data: blocks } = useGetPollingBlocks();

  const blocksTimeline = useMemo<TimelineItem[]>(
    () =>
      blocks.map((block) => ({
        id: block.id,
        label: <BlockItem block={block} />,
      })),
    [blocks]
  );

  return (
    <div className={classes.root}>
      <Timeline items={blocksTimeline} />
    </div>
  );
}

function BlockItem(props: { block: Block }) {
  const { block } = props;
  return (
    <div>
      <code>#{block.height}</code>
    </div>
  );
}
