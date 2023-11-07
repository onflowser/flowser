import React, { ReactElement } from "react";
import classes from "./PublicPrivateStorageCard.module.scss";
import { StorageDomainBadge } from "../StorageDomainBadge/StorageDomainBadge";
import gradient from "./gradient.png";
import classNames from "classnames";
import { ProjectLink } from "../../common/links/ProjectLink";
import { FlowserIcon } from "../../common/icons/FlowserIcon";
import { FlowAccountStorage } from "@onflowser/api";
import { useGetTokenMetadataList } from "../../api";
import { TokenIcon } from "../../common/icons/TokenIcon/TokenIcon";

type StorageCardProps = {
  currentAccountAddress: string;
  storageItem: FlowAccountStorage;
};

export const focusedStorageIdParamKey = "focusedStorageId";

export function PublicPrivateStorageCard({
  storageItem,
  currentAccountAddress,
}: StorageCardProps): ReactElement {
  const targetStorageCardUrl = getTargetStorageCardUrl({
    currentAccountAddress,
    storageItem,
  });
  const { data: tokenMetadataList } = useGetTokenMetadataList();
  const tokenMetadata = tokenMetadataList?.find((token) =>
    new Set([token.path.balance, token.path.vault, token.path.receiver]).has(
      storageItem.targetPath,
    ),
  );

  const pathIdentifier = storageItem.path.split("/").reverse()[0];

  return (
    <div
      className={classNames(classes.root, {
        [classes.introAnimation]: false,
      })}
    >
      <img className={classes.background} src={gradient} alt="" />
      <div className={classes.content}>
        <div className={classes.domainBadgeWrapper}>
          <StorageDomainBadge pathDomain={storageItem.domain} />
        </div>
        <div className={classes.identifierAndLogo}>
          {tokenMetadata && <TokenIcon token={tokenMetadata} />}
          <div className={classes.identifier}>{pathIdentifier}</div>
        </div>
        <ProjectLink className={classes.link} to={targetStorageCardUrl} replace>
          <FlowserIcon.Link />
          <div className={classes.linkText}>{storageItem.targetPath}</div>
        </ProjectLink>
      </div>
    </div>
  );
}

function getTargetStorageCardUrl(options: {
  currentAccountAddress: string;
  storageItem: FlowAccountStorage;
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
