import { useQuery } from "react-query";
import { useCallback, useEffect, useState } from "react";
import { PollingResponse, PollingEntity } from "@flowser/shared";

export interface TimeoutPollingHook<T extends PollingEntity> {
  stopPolling: () => void;
  startPolling: () => void;
  fetchAll: () => void;
  isFetching: boolean;
  firstFetch: boolean;
  error: Error | null;
  data: DecoratedPollingEntity<T>[];
}

export type DecoratedPollingEntity<T> = T & {
  isNew: boolean;
  isUpdated: boolean;
};

type UseTimeoutPollingProps<
  T extends PollingEntity,
  R extends PollingResponse<T[]>
> = {
  resourceKey: string;
  resourceIdKey: keyof T;
  fetcher: ({ timestamp }: { timestamp: number }) => Promise<R>;
  interval?: number;
  newestFirst?: boolean;
};

export const useTimeoutPolling = <
  T extends PollingEntity,
  R extends PollingResponse<T[]>
>(
  props: UseTimeoutPollingProps<T, R>
): TimeoutPollingHook<T> => {
  const [lastPollingTime, setLastPollingTime] = useState(0);
  const [stop, setStop] = useState(false);
  const [data, setData] = useState<DecoratedPollingEntity<T>[]>([]);
  const [firstFetch, setFirstFetch] = useState(false);

  const fetchCallback = useCallback(() => {
    return props.fetcher({ timestamp: lastPollingTime });
  }, [lastPollingTime]);

  useEffect(() => fetchAll(), [props.resourceKey]);

  const { isFetching, error, refetch } = useQuery<PollingResponse<T[]>, Error>(
    props.resourceKey,
    fetchCallback,
    {
      onSuccess: (response) => {
        if (response.data.length) {
          const latestTimestamp = response.meta?.latestTimestamp ?? 0;

          const hasCompleteData = latestTimestamp === lastPollingTime;
          if (hasCompleteData) {
            return;
          }

          if (latestTimestamp > 0) {
            setLastPollingTime(latestTimestamp);
          }

          const newItems = mergeAndDecorateItems(
            data,
            response.data,
            props.resourceIdKey
          );

          if (props.newestFirst ?? true) {
            const sortedNewItems = newItems.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

            setData(sortedNewItems);
          } else {
            setData(newItems);
          }
        }
      },
      enabled: !stop,
      refetchInterval: props.interval || 1000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!isFetching && !firstFetch) {
      setFirstFetch(true);
    }
  }, [isFetching]);

  const stopPolling = (): void => {
    setStop(true);
  };

  const startPolling = (): void => {
    setStop(false);
  };

  const fetchAll = useCallback(() => {
    setData([]);
    setLastPollingTime(0);
    refetch();
  }, []);

  return {
    stopPolling,
    startPolling,
    fetchAll,
    isFetching,
    error,
    data,
    firstFetch,
  };
};

function remapDataIsNew<T extends PollingEntity>(
  data: T[],
  isNew: boolean
): DecoratedPollingEntity<T>[] {
  return data.map((item) => ({
    ...item,
    isNew,
    isUpdated: false,
  }));
}

function mergeAndDecorateItems<T extends PollingEntity>(
  oldItems: T[],
  newItems: T[],
  resourceIdKey: keyof T
) {
  const items = [...remapDataIsNew(oldItems, false)];

  newItems.forEach((newItem) => {
    const existingItemIndex = items.findIndex(
      (item) => item[resourceIdKey] === newItem[resourceIdKey]
    );
    const isExistingItem = existingItemIndex !== -1;
    if (isExistingItem) {
      items[existingItemIndex] = {
        ...newItem,
        isUpdated: Boolean(oldItems.length),
        isNew: false,
      };
    } else {
      items.push({
        ...newItem,
        isUpdated: false,
        isNew: Boolean(oldItems.length),
      });
    }
  });

  return items;
}
