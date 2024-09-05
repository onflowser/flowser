import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import classes from "./BlockLink.module.scss";
import { ProjectLink } from "../../common/links/ProjectLink/ProjectLink";
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
  const blockUrl = useBlockUrl(blockId);

  const blockIdDisplay = (
    <MiddleEllipsis className={classes.ellipsis}>
      {blockId}
    </MiddleEllipsis>
  )

  if (networkId === "emulator") {
    return (
      <ProjectLink to={blockUrl}>
        {blockIdDisplay}
      </ProjectLink>
    )
  } else {
    return (
      <ExternalLink href={blockUrl} inline>
        {blockIdDisplay}
      </ExternalLink>
    )
  }
}

function useBlockUrl(blockId: string): string {
  const networkId = useFlowNetworkId();
  const { data } = useGetBlock(blockId)

  switch (networkId) {
    case "emulator":
      return `/blocks/${blockId}`;
    case "mainnet":
      return `https://www.flowdiver.io/block/${data?.blockHeight}`
    case "testnet":
      return `https://www.testnet.flowdiver.io/block/${data?.blockHeight}`
  }
}
