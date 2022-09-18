import React, { FunctionComponent } from "react";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./TransactionStatusBadge.module.scss";
import { GrcpStatusCode, TransactionStatus } from "@flowser/shared";
import classNames from "classnames";

type GrcpStatusBadgeProps = {
  status: TransactionStatus | undefined;
  className?: string;
};

export const GrcpStatusBadge: FunctionComponent<GrcpStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusName = FlowUtils.getGrcpStatusName(status?.grcpStatus);
  const backgroundColor = getBackground(status?.grcpStatus);
  const color = getTextColor(status?.grcpStatus);

  return (
    <div
      className={classNames(classes.root, className)}
      style={{ backgroundColor, color }}
    >
      {statusName}
    </div>
  );
};

function getBackground(statusCode: GrcpStatusCode | undefined) {
  switch (statusCode) {
    case GrcpStatusCode.GRCP_STATUS_ABORTED:
    case GrcpStatusCode.GRCP_STATUS_CANCELLED:
    case GrcpStatusCode.GRCP_STATUS_UNAVAILABLE:
    case GrcpStatusCode.GRCP_STATUS_UNAUTHENTICATED:
    case GrcpStatusCode.GRCP_STATUS_DEADLINE_EXCEEDED:
    case GrcpStatusCode.GRCP_STATUS_ALREADY_EXISTS:
    case GrcpStatusCode.GRCP_STATUS_FAILED_PRECONDITION:
    case GrcpStatusCode.GRCP_STATUS_INVALID_ARGUMENT:
    case GrcpStatusCode.GRCP_STATUS_OUT_OF_RANGE:
    case GrcpStatusCode.GRCP_STATUS_INTERNAL:
    case GrcpStatusCode.GRCP_STATUS_UNIMPLEMENTED:
    case GrcpStatusCode.GRCP_STATUS_DATA_LOSS:
    case GrcpStatusCode.GRCP_STATUS_PERMISSION_DENIED:
    case GrcpStatusCode.GRCP_STATUS_RESOURCE_EXHAUSTED:
      return "#dd868b";
    case GrcpStatusCode.GRCP_STATUS_OK:
      return "#A2CE8D";
    case GrcpStatusCode.GRCP_STATUS_UNKNOWN:
    default:
      return "#D0D2D6";
  }
}

function getTextColor(statusCode: GrcpStatusCode | undefined) {
  switch (statusCode) {
    case GrcpStatusCode.GRCP_STATUS_ABORTED:
    case GrcpStatusCode.GRCP_STATUS_CANCELLED:
    case GrcpStatusCode.GRCP_STATUS_UNAVAILABLE:
    case GrcpStatusCode.GRCP_STATUS_UNAUTHENTICATED:
    case GrcpStatusCode.GRCP_STATUS_DEADLINE_EXCEEDED:
    case GrcpStatusCode.GRCP_STATUS_ALREADY_EXISTS:
    case GrcpStatusCode.GRCP_STATUS_FAILED_PRECONDITION:
    case GrcpStatusCode.GRCP_STATUS_INVALID_ARGUMENT:
    case GrcpStatusCode.GRCP_STATUS_OUT_OF_RANGE:
    case GrcpStatusCode.GRCP_STATUS_INTERNAL:
    case GrcpStatusCode.GRCP_STATUS_UNIMPLEMENTED:
    case GrcpStatusCode.GRCP_STATUS_DATA_LOSS:
    case GrcpStatusCode.GRCP_STATUS_PERMISSION_DENIED:
    case GrcpStatusCode.GRCP_STATUS_RESOURCE_EXHAUSTED:
    case GrcpStatusCode.GRCP_STATUS_OK:
      return "#FFFFF";
    case GrcpStatusCode.GRCP_STATUS_UNKNOWN:
    default:
      return "#D0D2D6";
  }
}
