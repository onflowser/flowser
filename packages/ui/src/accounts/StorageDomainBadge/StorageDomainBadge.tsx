import React, { ReactElement } from "react";
import classes from "./StorageDomainBadge.module.scss";
import { FlowUtils } from "../../utils/flow-utils";
import { FlowStorageDomain } from "@onflowser/api";

export type StorageBadgeProps = {
  pathDomain: FlowStorageDomain;
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
