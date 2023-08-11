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
import { useGatewayStatus } from "../hooks/use-api";

export interface TimeoutPollingHook<Response extends PollingEntity> {
  stopPolling: () => void;
  startPolling: () => void;
  refresh: () => void;
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
  enabled?: boolean;
};

export type TimeoutPolingState = {
  enabled: boolean;
  lastTimeoutPollingLookup: Map<string, number>;
  setTimeoutPolling: (resourceKey: string, timestamp: number) => void;
};

const TimeoutPollingContext = createContext({} as TimeoutPolingState);

export function useTimeoutPollingState(): TimeoutPolingState {
  return useContext(TimeoutPollingContext);
}

export function useProjectTimeoutPolling<
  Entity extends PollingEntity,
  Response extends PollingResponse<Entity[]>
>(props: UseTimeoutPollingProps<Entity, Response>): TimeoutPollingHook<Entity> {
  // TODO(react-query): Temporary disable initial load checks as they are causing issues
  //  See: https://www.notion.so/flowser/react-query-weird-behavior-d40ea15498b740b6899be3e42cb32945?pvs=4
  // const { isInitialLoad, error: initialLoadError } = useGatewayStatus();

  const timeoutPollingState = useTimeoutPolling<Entity, Response>({
    ...props,
    // enabled: !isInitialLoad,
  });

  return {
    ...timeoutPollingState,
    // error: initialLoadError || timeoutPollingState.error,
    // firstFetch: timeoutPollingState.firstFetch,
  };
}

export function useTimeoutPolling<
  Entity extends PollingEntity,
  Response extends PollingResponse<Entity[]>
>(props: UseTimeoutPollingProps<Entity, Response>): TimeoutPollingHook<Entity> {
  const { enabled = true } = props;
  const {
    lastTimeoutPollingLookup,
    setTimeoutPolling,
    enabled: isGloballyEnabled,
  } = useTimeoutPollingState();
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
      enabled: isGloballyEnabled && enabled,
    }
  );

  const data = useMemo(
    () => remapWithMetadata(response?.data, lastPollingTime),
    [response, lastPollingTime]
  );

  useEffect(() => {
    if (data) {
      setTimeoutPolling(props.resourceKey, findMaxTimestamp(response?.data));
    }
  }, [data, response?.data]);

  return {
    data,
    firstFetch: !response && isFetching,
    startPolling: () => null,
    stopPolling: () => null,
    refresh: () => null,
    isFetching,
    error,
  };
}

export function TimeoutPollingProvider({
  children,
  enabled = true,
}: {
  enabled?: boolean;
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
        enabled,
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
