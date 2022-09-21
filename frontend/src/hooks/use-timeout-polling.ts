import { useQuery } from "react-query";
import { useCallback, useEffect, useState } from "react";
import { PollingResponse, PollingEntity } from "@flowser/shared";

export interface TimeoutPollingHook<Response extends PollingEntity> {
  stopPolling: () => void;
  startPolling: () => void;
  fetchAll: () => void;
  isFetching: boolean;
  firstFetch: boolean;
  error: Error | null;
  data: DecoratedPollingEntity<Response>[];
}

export type DecoratedPollingEntity<T> = T & {
  isNew: boolean;
  isUpdated: boolean;
};

type UseTimeoutPollingProps<
  Entity extends PollingEntity,
  Response extends PollingResponse<Entity[]>,
  Request = unknown
> = {
  resourceKey: string;
  resourceIdKey: keyof Entity;
  params?: Omit<Request, "timestamp">;
  fetcher: (
    params: { timestamp: number } & Omit<Request, "timestamp">
  ) => Promise<Response>;
  interval?: number;
  newestFirst?: boolean;
};

/**
 * @deprecated This should be removed soon.
 */
export const useTimeoutPolling = <
  Entity extends PollingEntity,
  Response extends PollingResponse<Entity[]>,
  Request = unknown
>(
  props: UseTimeoutPollingProps<Entity, Response, Request>
): TimeoutPollingHook<Entity> => {
  const [lastPollingTime, setLastPollingTime] = useState(0);
  const [stop, setStop] = useState(false);
  const [data, setData] = useState<DecoratedPollingEntity<Entity>[]>([]);
  const [firstFetch, setFirstFetch] = useState(false);

  const fetchCallback = useCallback(() => {
    return props.fetcher(
      Object.assign({ timestamp: lastPollingTime }, props.params)
    );
  }, [lastPollingTime, props.params]);

  useEffect(() => fetchAll(), [props.resourceKey]);

  const { isFetching, error, refetch } = useQuery<
    PollingResponse<Entity[]>,
    Error
  >(props.resourceKey, fetchCallback, {
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
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setData(sortedNewItems);
        } else {
          setData(newItems);
        }
      }
    },
    enabled: !stop,
    refetchInterval: props.interval ?? 2000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

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
    setFirstFetch(true);
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

export function useTimeoutPollingV2<
  Entity extends PollingEntity,
  Response extends PollingResponse<Entity[]>,
  Request = unknown
>(
  props: UseTimeoutPollingProps<Entity, Response, Request>
): TimeoutPollingHook<Entity> {
  const {
    data: response,
    isFetching,
    error,
  } = useQuery<PollingResponse<Entity[]>, Error>(
    props.resourceKey,
    () => props.fetcher(Object.assign({ timestamp: 0 }, props.params)),
    {
      refetchInterval: props.interval ?? 2000,
    }
  );

  return {
    data: remapDataIsNew(response?.data, false),
    firstFetch: !response && isFetching,
    startPolling: () => null,
    stopPolling: () => null,
    fetchAll: () => null,
    isFetching,
    error,
  };
}

function remapDataIsNew<T extends PollingEntity>(
  data: T[] | undefined,
  isNew: boolean
): DecoratedPollingEntity<T>[] {
  return (
    data?.map((item) => ({
      ...item,
      isNew,
      isUpdated: false,
    })) ?? []
  );
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
