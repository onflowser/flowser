import { useQuery } from "react-query";
import { useCallback, useEffect, useState } from "react";
import axios from "../config/axios";

export interface TimeoutPollingHook<T> {
  stopPolling: () => void;
  startPolling: () => void;
  isFetching: boolean;
  firstFetch: boolean;
  error: Error | null;
  data: T[];
}

export const useTimeoutPolling = <T>(
  resource: string,
  resourceId?: string,
  interval?: number,
  newestFirst = true
): TimeoutPollingHook<T> => {
  const [pollingTime, setPollingTime] = useState(0);
  const [stop, setStop] = useState(false);
  const [data, setData] = useState<any>([]);
  const [firstFetch, setFirstFetch] = useState(false);

  const fetchCallback = useCallback<any>(() => {
    return axios.get(resource, {
      params: {
        timestamp: pollingTime,
      },
    });
  }, [pollingTime]);

  const { isFetching, error } = useQuery<{ data: T[] }, Error>(
    resource,
    fetchCallback,
    {
      onSuccess: (response: any) => {
        if (response.status === 200 && response.data?.data?.length) {
          const latestTimestamp = response.data?.meta?.latestTimestamp;
          if (latestTimestamp > 0) {
            setPollingTime(latestTimestamp);
          }

          const remapDataIsNew = (data: any[], isNew: boolean): any[] => {
            return data.map((item: any) => ({ ...item, isNew }));
          };

          const newData = [...remapDataIsNew(data, false)];
          // UPDATED ITEMS
          if (resourceId) {
            const updatedItems = response.data.data.filter(
              (item: any) =>
                !!item.updatedAt && item.updatedAt >= item.createdAt
            );

            if (updatedItems.length) {
              updatedItems.forEach((updatedItem: any, index: number) => {
                if (newData.length === 0) {
                  newData.push({
                    ...updatedItem,
                    isUpdated: false,
                    isNew: false,
                  });
                } else {
                  const i = newData.findIndex((item: any) => {
                    if (
                      !item.hasOwnProperty(resourceId) ||
                      !updatedItem.hasOwnProperty(resourceId)
                    ) {
                      return false;
                    }
                    return item[resourceId] === updatedItem[resourceId];
                  });
                  if (i !== -1) {
                    newData[i] = {
                      ...updatedItems[index],
                      isUpdated: !!data.length,
                      isNew: false,
                    };
                  } else {
                    newData.push({
                      ...updatedItems[index],
                      isUpdated: false,
                      isNew: !!data.length,
                    });
                  }
                }
              });
              setData(newData);
            }
          }

          // NEW ITEMS
          const newItems = response.data.data.filter(
            (item: any) => !item.updatedAt || item.updatedAt < item.createdAt
          );

          if (newestFirst) {
            const sortedData = [
              ...newData,
              ...remapDataIsNew(newItems, !!data.length),
            ].sort((a, b) => {
              return b.createdAt - a.createdAt;
            });
            setData(sortedData);
          } else {
            setData((state: any) => [
              ...newData,
              ...remapDataIsNew(newItems, !!state.length),
            ]);
          }
        }
      },
      enabled: !stop,
      refetchInterval: interval || 1000,
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

  return {
    stopPolling,
    startPolling,
    isFetching,
    error,
    data,
    firstFetch,
  };
};
