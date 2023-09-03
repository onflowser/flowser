import React, { ReactElement } from "react";
import classes from "./PublicPrivateStorageCard.module.scss";
import { StorageDomainBadge } from "../StorageDomainBadge";
import { ReactComponent as LinkIcon } from "../../../../../assets/icons/link.svg";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import gradient from "../../../../../assets/images/gradient.png";
import classNames from "classnames";
import { ProjectLink } from "../../../../../components/link/ProjectLink";

type StorageCardProps = {
  currentAccountAddress: string;
  enableIntroAnimation?: boolean;
  storageItem: DecoratedPollingEntity<AccountStorageItem>;
};

export const focusedStorageIdParamKey = "focusedStorageId";

export function PublicPrivateStorageCard({
  storageItem,
  currentAccountAddress,
  enableIntroAnimation = true,
}: StorageCardProps): ReactElement {
  const targetPathIdentifier = storageItem.data?.TargetPath?.Identifier ?? "-";
  const borrowType = storageItem.data?.BorrowType ?? "-";
  const targetStorageCardUrl = getTargetStorageCardUrl({
    currentAccountAddress,
    data: storageItem.data,
  });

  return (
    <div
      className={classNames(classes.root, {
        [classes.introAnimation]:
          enableIntroAnimation && (storageItem.isUpdated || storageItem.isNew),
      })}
    >
      <img className={classes.background} src={gradient} alt="" />
      <div className={classes.content}>
        <StorageDomainBadge pathDomain={storageItem.pathDomain} />
        <div className={classes.identifier}>{storageItem.pathIdentifier}</div>
        <ProjectLink className={classes.link} to={targetStorageCardUrl} replace>
          <LinkIcon />
          <div className={classes.linkText}>{targetPathIdentifier}</div>
        </ProjectLink>
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
  // Public or private storage paths can only
  // point to "internal" storage paths of the same account.
  // https://developers.flow.com/cadence/language/capability-based-access-control
  const targetAccountAddress = options.currentAccountAddress;

  const targetPathIdentifier = options.data?.TargetPath?.Identifier;

  const params = new URLSearchParams();
  if (targetPathIdentifier) {
    const targetStorageId = `${targetAccountAddress}/storage/${targetPathIdentifier}`;
    params.set(focusedStorageIdParamKey, targetStorageId);
  }

  // TODO(milestone-x): Navigate to a specific sub-structure of the react-json-view (research)?
  return borrowTypePathParts
    ? `/accounts/${targetAccountAddress}?${params.toString()}`
    : "#";
}
