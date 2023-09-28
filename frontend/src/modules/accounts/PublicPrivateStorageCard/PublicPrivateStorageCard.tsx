import React, { ReactElement } from "react";
import classes from "./PublicPrivateStorageCard.module.scss";
import { StorageDomainBadge } from "../StorageDomainBadge/StorageDomainBadge";
import { ReactComponent as LinkIcon } from "../../../assets/icons/link.svg";
import { AccountStorageItem } from "@flowser/shared/dist/src/generated/entities/accounts";
import { DecoratedPollingEntity } from "contexts/timeout-polling.context";
import gradient from "../../../assets/images/gradient.png";
import classNames from "classnames";
import { ProjectLink } from "../../../components/links/ProjectLink";

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
  const borrowType = storageItem.data?.BorrowType ?? "-";
  const targetStorageCardUrl = getTargetStorageCardUrl({
    currentAccountAddress,
    storageItem,
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
        <div className={classes.identifier}>{storageItem.path}</div>
        <ProjectLink className={classes.link} to={targetStorageCardUrl} replace>
          <LinkIcon />
          <div className={classes.linkText}>{storageItem.targetPath}</div>
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
  storageItem: AccountStorageItem;
}) {
  const { currentAccountAddress, storageItem } = options;

  // Public or private storage paths can only
  // point to "internal" storage paths of the same account.
  // https://developers.flow.com/cadence/language/capability-based-access-control
  const params = new URLSearchParams();
  const targetStorageId = `${currentAccountAddress}/storage/${storageItem.targetPath}`;
  params.set(focusedStorageIdParamKey, targetStorageId);

  return `/accounts/${currentAccountAddress}?${params.toString()}`;
}
