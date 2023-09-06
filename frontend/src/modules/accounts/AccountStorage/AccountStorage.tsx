import { Account, AccountStorageDomain } from "@flowser/shared";
import { useAnalytics } from "../../../hooks/use-analytics";
import { useUrlQuery } from "../../../hooks/use-url-query";
import { useGetPollingStorageByAccount } from "../../../hooks/use-api";
import React, { ReactElement, useEffect, useState } from "react";
import { AnalyticEvent } from "../../../services/analytics.service";
import { PublicPrivateStorageCard } from "../PublicPrivateStorageCard/PublicPrivateStorageCard";
import { enableDetailsIntroAnimation } from "../../../config/common";
import { InternalStorageCard } from "../InternalStorageCard/InternalStorageCard";
import classNames from "classnames";
import classes from "./AccountStorage.module.scss";
import { scrollableElementId } from "../../../components/layout/Layout";

type AccountStorageProps = {
  account: Account;
};

export function AccountStorage(props: AccountStorageProps): ReactElement {
  const { account } = props;
  const { track } = useAnalytics();
  const urlQueryParams = useUrlQuery();
  const focusedStorageId = urlQueryParams.get("focusedStorageId");
  const { data: storageItems } = useGetPollingStorageByAccount(account.address);
  const [expandedCardIds, setExpandedCardIds] = useState(
    new Set<string>(focusedStorageId ? [focusedStorageId] : [])
  );

  useEffect(() => {
    if (focusedStorageId) {
      expandCardById(focusedStorageId);
      // We need to wait for the virtual nodes to be added to the browser DOM.
      // This is achieved with setTimeout call - wait for the next window paint.
      // There might be a better React way to do this.
      setTimeout(() => {
        const targetDomNode = document.getElementById(focusedStorageId);
        document
          .getElementById(scrollableElementId)
          ?.scrollTo(0, targetDomNode?.offsetTop ?? 0);
      });
    }
  }, [focusedStorageId, storageItems]);

  const expandCardById = (id: string) => {
    setExpandedCardIds((prev) => new Set(prev.add(id)));
  };

  const minimizeCardById = (id: string) => {
    expandedCardIds.delete(id);
    setExpandedCardIds(new Set(expandedCardIds));
  };

  const toggleCardExpand = (id: string) => {
    if (expandedCardIds.has(id)) {
      track(AnalyticEvent.CLICK_MINIMIZE_STORAGE_CARD, {
        storageId: id,
      });
      minimizeCardById(id);
    } else {
      track(AnalyticEvent.CLICK_EXPAND_STORAGE_CARD, {
        storageId: id,
      });
      expandCardById(id);
    }
  };

  const privateStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_PRIVATE
  );
  const publicStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_PUBLIC
  );
  const internalStorageItems = storageItems.filter(
    (item) => item.pathDomain === AccountStorageDomain.STORAGE_DOMAIN_STORAGE
  );

  const privateAndPublicStorageItems = [
    ...publicStorageItems,
    ...privateStorageItems,
  ];
  return (
    <>
      <div className={classes.grid}>
        {privateAndPublicStorageItems.map((item) => (
          <PublicPrivateStorageCard
            key={item.id}
            enableIntroAnimation={enableDetailsIntroAnimation}
            currentAccountAddress={account.address}
            storageItem={item}
          />
        ))}
      </div>
      <div className={classes.gridExtendable}>
        {internalStorageItems.map((item) => (
          <InternalStorageCard
            key={item.id}
            storageItem={item}
            enableIntroAnimation={enableDetailsIntroAnimation}
            onToggleExpand={() => toggleCardExpand(item.id)}
            isExpanded={expandedCardIds.has(item.id)}
            className={classNames({
              [classes.gridItemExtended]: expandedCardIds.has(item.id),
            })}
          />
        ))}
      </div>
    </>
  );
}
