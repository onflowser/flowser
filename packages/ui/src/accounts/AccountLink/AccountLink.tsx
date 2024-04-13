import React, { ReactElement } from "react";
import { AccountAvatar } from "../AccountAvatar/AccountAvatar";
import { AccountName } from "../AccountName/AccountName";
import classes from "./AccountLink.module.scss";
import { ProjectLink } from "../../common/links/ProjectLink";
import { useFlowNetworkId } from "../../contexts/flow-network.context";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";
import { FlowUtils } from "@onflowser/core/src/flow-utils";

type AccountLinkProps = {
  address: string;
};

export function AccountLink(props: AccountLinkProps): ReactElement {
  const { address } = props;
  const networkId = useFlowNetworkId();
  const accountUrl = FlowUtils.getFlowViewAccountUrl(networkId, address)

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
