import { useQuery } from 'react-query';
import axios from 'axios';

export const useApi = () => {
    const get = <T>(url: string) => useQuery<{ data: T }, Error>('get', async () => axios.get(url));
    return {
        get,
    };
};
