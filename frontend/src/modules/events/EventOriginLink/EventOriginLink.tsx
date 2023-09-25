import { Event } from "@flowser/shared";
import { ProjectLink } from "../../../components/links/ProjectLink";
import { ExternalLink } from "../../../components/links/ExternalLink";
import React, { ReactElement } from "react";
import { EventUtils } from "../utils";

export function EventOriginLink(props: { event: Event }): ReactElement {
  const { type } = props.event;

  const { contractName, contractAddress } = EventUtils.parseFullEventType(type);

  // Core flow events are emitted from the Flow Virtual Machine.
  if (contractName && contractAddress) {
    return (
      <ProjectLink to={`/contracts/0x${contractAddress}.${contractName}`}>
        A.{contractAddress}.{contractName}
      </ProjectLink>
    );
  } else {
    return (
      <ExternalLink
        inline
        href="https://developers.flow.com/cadence/language/core-events"
      >
        FVM
      </ExternalLink>
    );
  }
}
