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
    case GrcpStatusCode.GRCP_STATUS_FAILED:
      return "#dd868b";
    case GrcpStatusCode.GRCP_STATUS_OK:
      return "#A2CE8D";
    default:
      return "#D0D2D6";
  }
}

function getTextColor(statusCode: GrcpStatusCode | undefined) {
  switch (statusCode) {
    case GrcpStatusCode.GRCP_STATUS_OK:
      return "#218300";
    case GrcpStatusCode.GRCP_STATUS_FAILED:
      return "#FFFFF";
    default:
      return "#D0D2D6";
  }
}
