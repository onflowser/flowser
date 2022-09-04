import React from "react";
import { GrcpStatusCode } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";

type StatusIconProps = {
  status: GrcpStatusCode | undefined;
  statusType?: string;
};

export function StatusIcon({ status, statusType }: StatusIconProps) {
  const icon = FlowUtils.getGrcpStatusIcon(status);
  return <div>{icon}</div>;
}
