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
    case GrcpStatusCode.GRCP_STATUS_FAILED:
      return <ExpiredIcon />;
    case GrcpStatusCode.UNRECOGNIZED:
    default:
      return <UnknownIcon />;
  }
}
