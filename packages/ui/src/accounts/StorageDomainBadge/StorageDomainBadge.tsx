import React, { ReactElement } from "react";
import classes from "./StorageDomainBadge.module.scss";
import { AccountStorageDomain } from "@flowser/shared";
import { FlowUtils } from "../../utils/flow-utils";

export type StorageBadgeProps = {
  pathDomain: AccountStorageDomain;
};

export function StorageDomainBadge({
  pathDomain,
}: StorageBadgeProps): ReactElement {
  return (
    <div className={classes.root}>
      {FlowUtils.getLowerCasedPathDomain(pathDomain)}
    </div>
  );
}
