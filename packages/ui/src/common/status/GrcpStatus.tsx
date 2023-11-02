import React, { ReactElement } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";
import { GrcpStatusCode, TransactionStatus } from "@onflowser/api";
import { FlowserIcon } from "../icons/FlowserIcon";

export type GrcpStatusProps = {
  status: TransactionStatus | undefined;
};

export function GrcpStatus({ status }: GrcpStatusProps): ReactElement {
  const { grcpStatus } = status ?? {};
  const statusName = FlowUtils.getGrcpStatusName(grcpStatus);
  return (
    <div className={classes.root}>
      <GrcpStatusIcon statusCode={grcpStatus} />
      <span className={classes.statusLabel}>{statusName}</span>
    </div>
  );
}

type GrcpStatusIconProps = {
  statusCode: GrcpStatusCode | undefined;
  size?: number;
};

export function GrcpStatusIcon(props: GrcpStatusIconProps): ReactElement {
  const iconProps = props.size ? { width: props.size, height: props.size } : {};
  switch (props.statusCode) {
    case GrcpStatusCode.GRCP_STATUS_OK:
      return <FlowserIcon.CircleCheck {...iconProps} />;
    case GrcpStatusCode.GRCP_STATUS_FAILED:
      return <FlowserIcon.CircleCross {...iconProps} />;
    case GrcpStatusCode.UNRECOGNIZED:
    default:
      return <FlowserIcon.CircleQuestionMark {...iconProps} />;
  }
}
