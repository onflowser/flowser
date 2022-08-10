import { AxiosResponse } from "axios";
import { useQuery } from "react-query";

export type GetAxiosQueryOptions<T> = {
  resourceKey: string;
  fetcher: () => Promise<AxiosResponse<T>>;
  refetchInterval?: number;
};

export function useGetAxiosQuery<T>(options: GetAxiosQueryOptions<T>) {
  const query = useQuery<AxiosResponse<T>>(
    options.resourceKey,
    options.fetcher,
    {
      refetchInterval: options.refetchInterval,
    }
  );

  return {
    ...query,
    data: query?.data?.data,
  };
}
