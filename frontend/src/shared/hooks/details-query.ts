import { useQuery } from 'react-query';
import axios from '../axios';
import { useState } from 'react';

export const useDetailsQuery = <T>(resource: string, interval?: number) => {
    const [pollingTime, setPollingTime] = useState(0);
    const [data, setData] = useState<any>();

    const query = useQuery<T>(resource, () => axios.get(resource).then(({ data }) => data), {
        onSuccess(data: any) {
            let latestTimestamp = 0;

            const mapDataArray = (data: any[]) =>
                data.map((e: any) => {
                    // skip mapping for primary value types (string, number)
                    if (!(e instanceof Object)) {
                        return e;
                    }
                    let isNew = false;
                    const checkTimestamp = (t: number) => {
                        if (t > latestTimestamp) {
                            latestTimestamp = t;
                        }
                        if (t >= pollingTime) {
                            isNew = true;
                        }
                    };
                    [e.createdAt, e.updatedAt].forEach(checkTimestamp);
                    return { ...e, isNew };
                });

            const formattedData = Object.keys(data)
                .map((key) => {
                    if (data[key] instanceof Array) {
                        return { [key]: mapDataArray(data[key]) };
                    } else {
                        return { [key]: data[key] };
                    }
                })
                .reduce((p, c) => ({ ...p, ...c }), {});

            setData(formattedData);

            if (latestTimestamp > 0) {
                setPollingTime(latestTimestamp);
            }
        },
        refetchInterval: interval || 1000,
        refetchOnWindowFocus: 'always',
    });

    return { ...query, data };
};
