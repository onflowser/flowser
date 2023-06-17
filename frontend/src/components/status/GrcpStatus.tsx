import React, { ReactElement } from "react";
import { GrcpStatusCode, TransactionStatus } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";
import classes from "./Status.module.scss";
import { ReactComponent as ExpiredIcon } from "../../assets/icons/expired-tx-icon.svg";
import { ReactComponent as SealedIcon } from "../../assets/icons/sealed-tx-icon.svg";
import { ReactComponent as UnknownIcon } from "../../assets/icons/unknown-tx-icon.svg";

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

function GrcpStatusIcon(props: { statusCode: GrcpStatusCode | undefined }) {
  switch (props.statusCode) {
    case GrcpStatusCode.GRCP_STATUS_OK:
      return <SealedIcon />;
    case GrcpStatusCode.GRCP_STATUS_CANCELLED:
    case GrcpStatusCode.GRCP_STATUS_INVALID_ARGUMENT:
    case GrcpStatusCode.GRCP_STATUS_DEADLINE_EXCEEDED:
    case GrcpStatusCode.GRCP_STATUS_NOT_FOUND:
    case GrcpStatusCode.GRCP_STATUS_ALREADY_EXISTS:
    case GrcpStatusCode.GRCP_STATUS_PERMISSION_DENIED:
    case GrcpStatusCode.GRCP_STATUS_RESOURCE_EXHAUSTED:
    case GrcpStatusCode.GRCP_STATUS_FAILED_PRECONDITION:
    case GrcpStatusCode.GRCP_STATUS_ABORTED:
    case GrcpStatusCode.GRCP_STATUS_OUT_OF_RANGE:
    case GrcpStatusCode.GRCP_STATUS_UNIMPLEMENTED:
    case GrcpStatusCode.GRCP_STATUS_INTERNAL:
    case GrcpStatusCode.GRCP_STATUS_UNAVAILABLE:
    case GrcpStatusCode.GRCP_STATUS_DATA_LOSS:
    case GrcpStatusCode.GRCP_STATUS_UNAUTHENTICATED:
      return <ExpiredIcon />;
    case GrcpStatusCode.GRCP_STATUS_UNKNOWN:
    default:
      return <UnknownIcon />;
  }
}
