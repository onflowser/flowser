import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import classes from "./BlockLink.module.scss";
import { ProjectLink } from "../../common/links/ProjectLink";
import React from "react";
import { useFlowNetworkId } from "../../contexts/flow-network.context";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";
import { useGetBlock } from "../../api";

type BlockLinkProps = {
  blockId: string;
}

export function BlockLink(props: BlockLinkProps) {
  const {blockId} = props;
  const networkId = useFlowNetworkId();
  const { data } = useGetBlock(blockId)

  const blockIdDisplay = (
    <MiddleEllipsis className={classes.ellipsis}>
      {blockId}
    </MiddleEllipsis>
  )

  if (networkId === "emulator") {
    return (
      <ProjectLink to={`/blocks/${blockId}`}>
        {blockIdDisplay}
      </ProjectLink>
    )
  } else {
    return (
      <ExternalLink href={`https://www.flowdiver.io/block/${data?.blockHeight}`} inline>
        {blockIdDisplay}
      </ExternalLink>
    )
  }
}
