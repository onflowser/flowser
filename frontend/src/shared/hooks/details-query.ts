import { useQuery } from 'react-query';
import axios from 'axios';

export const useDetailsQuery = <T>(resource: string, interval?: number) => {
    return useQuery<T>(resource, () => axios.get(resource).then(({ data }) => data), {
        refetchInterval: interval || 1000,
        refetchOnWindowFocus: 'always',
    });
};
