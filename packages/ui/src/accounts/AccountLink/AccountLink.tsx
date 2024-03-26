import React, { ReactElement } from "react";
import { AccountAvatar } from "../AccountAvatar/AccountAvatar";
import { AccountName } from "../AccountName/AccountName";
import classes from "./AccountLink.module.scss";
import { ProjectLink } from "../../common/links/ProjectLink";
import { useFlowNetworkId } from "../../contexts/flow-network.context";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";

type AccountLinkProps = {
  address: string;
};

export function AccountLink(props: AccountLinkProps): ReactElement {
  const { address } = props;
  const networkId = useFlowNetworkId();
  const accountUrl = useAccountUrl(address);

  const accountDisplay = (
    <>
      <AccountAvatar address={address} size={25} />
      <AccountName address={address} />
    </>
  )

  if (networkId === "emulator") {
    return (
      <ProjectLink to={`/accounts/${address}`} className={classes.root}>
        {accountDisplay}
      </ProjectLink>
    );
  } else {
    return (
      <ExternalLink href={accountUrl} className={classes.root} inline>
        {accountDisplay}
      </ExternalLink>
    );
  }

}

function useAccountUrl(address: string) {
  const networkId = useFlowNetworkId();

  switch (networkId) {
    case "emulator":
      return `https://www.emulator.flowview.app/account/${address}`
    case "mainnet":
      return `https://www.flowview.app/account/${address}`
    case "testnet":
      return `https://www.testnet.flowview.app/account/${address}`
  }
}
