import React, { ReactElement } from "react";
import classes from "./PublicPrivateStorageCard.module.scss";
import { StorageDomainBadge } from "./StorageDomainBadge";
import { NavLink } from "react-router-dom";
import { ReactComponent as LinkIcon } from "../../../assets/icons/link.svg";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
// @ts-ignore .png import error
import gradient from "../../../assets/images/gradient.png";

type StorageCardProps = {
  content: DecoratedPollingEntity<AccountStorageItem>;
};

export function PublicPrivateStorageCard({
  content,
}: StorageCardProps): ReactElement {
  const targetPathIdentifier = content.data?.TargetPath?.Identifier ?? "-";
  const borrowType = content.data?.BorrowType ?? "-";
  const borrowTypePathParts = borrowType?.split(".");
  const targetAccountAddress = `0x${borrowTypePathParts?.[1]}`;
  const targetStorageId = `${targetAccountAddress}/storage/${targetPathIdentifier}`;
  // TODO(milestone-x): Navigate to a specific sub-structure of the react-json-view (research)?
  const targetUrl = borrowTypePathParts
    ? `/accounts/details/${targetAccountAddress}?focusedStorageId=${targetStorageId}`
    : "#";
  return (
    <div className={classes.root}>
      <img className={classes.background} src={gradient} alt="" />
      <div className={classes.content}>
        <StorageDomainBadge pathDomain={content.pathDomain} />
        <div className={classes.identifier}>{content.pathIdentifier}</div>
        <NavLink className={classes.link} to={targetUrl}>
          <LinkIcon />
          <div className={classes.linkText}>{targetPathIdentifier}</div>
        </NavLink>
        <span title={borrowType} className={classes.bottomText}>
          {borrowType}
        </span>
      </div>
    </div>
  );
}
