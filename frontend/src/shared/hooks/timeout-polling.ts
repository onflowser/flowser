import { useQuery } from 'react-query';
import { useCallback, useState } from 'react';
import axios from 'axios';

export interface TimeoutPollingHook<T> {
    stopPolling: () => void;
    startPolling: () => void;
    isFetching: boolean;
    error: Error | null;
    data: T[] | undefined;
}

export const useTimeoutPolling = <T>(resource: string, interval = 1000): TimeoutPollingHook<T> => {
    const [pollingTime, setPollingTime] = useState(0);
    const [stop, setStop] = useState(false);
    const [data, setData] = useState<any>([]);

    const fetchCallback = useCallback<any>(() => {
        return axios.get(resource, {
            params: {
                timestamp: pollingTime,
            },
        });
    }, [pollingTime]);

    const { isFetching, error } = useQuery<{ data: T[] }, Error>('polling', fetchCallback, {
        onSuccess: (response: any) => {
            if (response.status === 200 && response.data.data.length) {
                const latestTimestamp = response.data?.meta?.latestTimestamp;
                if (latestTimestamp > 0) {
                    setPollingTime(latestTimestamp);
                }

                const remapData = (data: any[], isNew: boolean): any[] => {
                    return data.map((item: any) => ({ ...item, isNew }));
                };

                setData((state: any) => [...remapData(state, false), ...remapData(response.data.data, !!state.length)]);
            }
        },
        enabled: !stop,
        refetchInterval: interval,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: false,
    });

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
    };
};
