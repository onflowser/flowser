import { useFlowNetworkId } from "../../contexts/flow-network.context";
import { MiddleEllipsis } from "../../common/ellipsis/MiddleEllipsis";
import classes from "./TransactionLink.module.scss";
import { ProjectLink } from "../../common/links/ProjectLink/ProjectLink";
import React from "react";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";

type TransactionLinkProps = {
  transactionId: string;
}

export function TransactionLink(props: TransactionLinkProps) {
  const {transactionId} = props;
  const networkId = useFlowNetworkId();
  const transactionUrl = useTransactionUrl(transactionId);

  const transactionIdDisplay = (
    <MiddleEllipsis className={classes.ellipsis}>
      {transactionId}
    </MiddleEllipsis>
  )

  if (networkId === "emulator") {
    return (
      <ProjectLink to={transactionUrl}>
        {transactionIdDisplay}
      </ProjectLink>
    )
  } else {
    return (
      <ExternalLink href={transactionUrl} inline>
        {transactionIdDisplay}
      </ExternalLink>
    )
  }
}

function useTransactionUrl(transactionId: string): string {
  const networkId = useFlowNetworkId();

  switch (networkId) {
    case "emulator":
      return `/transactions/${transactionId}`;
    case "mainnet":
      return `https://www.flowdiver.io/tx/${transactionId}`
    case "testnet":
      return `https://www.testnet.flowdiver.io/tx/${transactionId}`
  }
}
