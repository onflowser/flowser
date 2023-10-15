import { AnalyticEvent, useAnalytics } from "../../hooks/use-analytics";
import { useUrlQuery } from "../../hooks/use-url-query";
import React, { ReactElement, useEffect, useState } from "react";
import { PublicPrivateStorageCard } from "../PublicPrivateStorageCard/PublicPrivateStorageCard";
import { InternalStorageCard } from "../InternalStorageCard/InternalStorageCard";
import classNames from "classnames";
import classes from "./AccountStorage.module.scss";
import { scrollableElementId } from "../../common/layouts/ProjectLayout/ProjectLayout";
import { FlowStorageDomain, FlowAccountStorage } from "@onflowser/api";

type AccountStorageProps = {
  storageItems: FlowAccountStorage[];
};

export function AccountStorage(props: AccountStorageProps): ReactElement {
  const { storageItems } = props;
  const { track } = useAnalytics();
  const urlQueryParams = useUrlQuery();
  const focusedStorageId = urlQueryParams.get("focusedStorageId");
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
    (item) => item.domain === FlowStorageDomain.STORAGE_DOMAIN_PRIVATE
  );
  const publicStorageItems = storageItems.filter(
    (item) => item.domain === FlowStorageDomain.STORAGE_DOMAIN_PUBLIC
  );
  const internalStorageItems = storageItems.filter(
    (item) => item.domain === FlowStorageDomain.STORAGE_DOMAIN_STORAGE
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
            currentAccountAddress={item.address}
            storageItem={item}
          />
        ))}
      </div>
      <div className={classes.gridExtendable}>
        {internalStorageItems.map((item) => (
          <InternalStorageCard
            key={item.id}
            storageItem={item}
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
