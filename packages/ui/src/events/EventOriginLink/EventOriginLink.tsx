import { ProjectLink } from "../../common/links/ProjectLink/ProjectLink";
import { ExternalLink } from "../../common/links/ExternalLink/ExternalLink";
import React, { ReactElement } from "react";
import { EventUtils } from "../utils";
import { FlowEvent } from "@onflowser/api";

export function EventOriginLink(props: { event: FlowEvent }): ReactElement {
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
