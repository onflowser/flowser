import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { PollingEntity, PollingResponse } from "@flowser/shared";
import { useQuery } from "react-query";

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
  Response extends PollingResponse<Entity[]>
> = {
  resourceKey: string;
  fetcher: (params: { timestamp: number }) => Promise<Response>;
  interval?: number;
  newestFirst?: boolean;
};

type TimeoutPolingState = {
  lastTimeoutPollingLookup: Map<string, number>;
  setTimeoutPolling: (resourceKey: string, timestamp: number) => void;
};

const TimeoutPollingContext = createContext({} as TimeoutPolingState);

export function useTimeoutPolling<
  Entity extends PollingEntity,
  Response extends PollingResponse<Entity[]>
>(props: UseTimeoutPollingProps<Entity, Response>): TimeoutPollingHook<Entity> {
  const { lastTimeoutPollingLookup, setTimeoutPolling } = useContext(
    TimeoutPollingContext
  );
  const lastPollingTime = lastTimeoutPollingLookup.get(props.resourceKey) ?? 0;
  const {
    data: response,
    isFetching,
    error,
  } = useQuery<PollingResponse<Entity[]>, Error>(
    props.resourceKey,
    () => props.fetcher({ timestamp: 0 }),
    {
      refetchInterval: props.interval ?? 2000,
    }
  );

  const data = useMemo(
    () => remapWithMetadata(response?.data, lastPollingTime),
    [response]
  );

  useEffect(() => {
    if (data) {
      setTimeoutPolling(props.resourceKey, findMaxTimestamp(response?.data));
    }
  }, [data]);

  return {
    data,
    firstFetch: !response && isFetching,
    startPolling: () => null,
    stopPolling: () => null,
    fetchAll: () => null,
    isFetching,
    error,
  };
}

export function TimeoutPollingProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const lastPollingTimeLookupRef = useRef(new Map());

  function setTimeoutPolling(resourceKey: string, timestamp: number) {
    lastPollingTimeLookupRef.current.set(resourceKey, timestamp);
  }

  return (
    <TimeoutPollingContext.Provider
      value={{
        lastTimeoutPollingLookup: lastPollingTimeLookupRef.current,
        setTimeoutPolling,
      }}
    >
      {children}
    </TimeoutPollingContext.Provider>
  );
}

const toTimestamp = (date: string) => new Date(date).getTime();

function remapWithMetadata<T extends PollingEntity>(
  data: T[] | undefined,
  lastPollingTime: number
): DecoratedPollingEntity<T>[] {
  return (
    data?.map((item) => ({
      isNew: toTimestamp(item.createdAt) > lastPollingTime,
      isUpdated: toTimestamp(item.updatedAt) > lastPollingTime,
      ...item,
    })) ?? []
  );
}

function findMaxTimestamp<T extends PollingEntity>(data: T[] | undefined) {
  const createdTimestamps =
    data?.map((item) => toTimestamp(item.createdAt)) ?? [];
  const updatedTimestamps =
    data?.map((item) => toTimestamp(item.updatedAt)) ?? [];
  const allTimestamps = [...createdTimestamps, ...updatedTimestamps];
  const maxTimestamp = Math.max(...allTimestamps);
  const minTimestamp = 0;
  return Math.max(maxTimestamp, minTimestamp);
}
