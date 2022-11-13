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
  currentAccountAddress: string;
  content: DecoratedPollingEntity<AccountStorageItem>;
};

export const focusedStorageIdParamKey = "focusedStorageId";

export function PublicPrivateStorageCard({
  content,
  currentAccountAddress,
}: StorageCardProps): ReactElement {
  const targetPathIdentifier = content.data?.TargetPath?.Identifier ?? "-";
  const borrowType = content.data?.BorrowType ?? "-";
  const targetStorageCardUrl = getTargetStorageCardUrl({
    currentAccountAddress,
    data: content.data,
  });

  return (
    <div className={classes.root}>
      <img className={classes.background} src={gradient} alt="" />
      <div className={classes.content}>
        <StorageDomainBadge pathDomain={content.pathDomain} />
        <div className={classes.identifier}>{content.pathIdentifier}</div>
        <NavLink className={classes.link} to={targetStorageCardUrl}>
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

function getTargetStorageCardUrl(options: {
  currentAccountAddress: string;
  data: Record<string, any> | undefined;
}) {
  // Borrow type structure depends on whether the type is stored
  // in the current account or not
  //
  // Paths that point to another account, include the account address:
  // Example: &A.0ae53cb6e3f42a79.FlowToken.Vault{A.ee82856bf20e2aa6.FungibleToken.Receiver}
  //
  // While paths that point to the current account do not:
  // Example: &String

  const borrowTypePathParts = options.data?.BorrowType?.split(".");
  const targetAccountAddress =
    borrowTypePathParts && borrowTypePathParts.length > 1
      ? `0x${borrowTypePathParts?.[1]}`
      : options.currentAccountAddress;

  const targetPathIdentifier = options.data?.TargetPath?.Identifier;

  const params = new URLSearchParams();
  if (targetPathIdentifier) {
    const targetStorageId = `${targetAccountAddress}/storage/${targetPathIdentifier}`;
    params.set(focusedStorageIdParamKey, targetStorageId);
  }

  // TODO(milestone-x): Navigate to a specific sub-structure of the react-json-view (research)?
  return borrowTypePathParts
    ? `/accounts/details/${targetAccountAddress}?${params.toString()}`
    : "#";
}
