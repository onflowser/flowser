import { useQuery } from "react-query";
import { useCallback, useEffect, useState } from "react";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export interface TimeoutPollingHook<T extends PollingEntity> {
  stopPolling: () => void;
  startPolling: () => void;
  isFetching: boolean;
  firstFetch: boolean;
  error: Error | null;
  data: T[];
}

// TODO: define shared types between frontend/backend
export interface PollingEntity {
  createdAt: string;
  updatedAt: string;
}

export type DecoratedPollingEntity<T> = T & {
  isNew: boolean;
  isUpdated: boolean;
};

export type PollingResponse<T extends PollingEntity> = {
  data: T[];
  meta: {
    latestTimestamp: number;
  };
};

// TODO: redefine arguments in object form
export const useTimeoutPolling = <T extends PollingEntity>(
  resource: string,
  resourceIdKey: keyof T, // TODO: should this be required?
  interval?: number,
  newestFirst = true
): TimeoutPollingHook<T> => {
  const [lastPollingTime, setLastPollingTime] = useState(0);
  const [stop, setStop] = useState(false);
  const [data, setData] = useState<T[]>([]);
  const [firstFetch, setFirstFetch] = useState(false);

  const fetchCallback = useCallback(() => {
    return axios.get(resource, {
      params: {
        timestamp: lastPollingTime,
      },
    });
  }, [lastPollingTime]);

  const { isFetching, error } = useQuery<
    AxiosResponse<PollingResponse<T>>,
    Error
  >(resource, fetchCallback, {
    onSuccess: (response) => {
      if (response.status === 200 && response.data?.data?.length) {
        const latestTimestamp = response.data?.meta?.latestTimestamp;
        if (latestTimestamp > 0) {
          setLastPollingTime(latestTimestamp);
        }

        const newItems = mergeAndDecorateItems(
          data,
          response.data.data,
          resourceIdKey
        );

        if (newestFirst) {
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
    refetchInterval: interval || 1000,
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

  return {
    stopPolling,
    startPolling,
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
