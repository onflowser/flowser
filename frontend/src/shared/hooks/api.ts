import { useQuery } from "react-query";
import axios from "../config/axios";

export const useApi = () => {
  const get = <T>(url: string) =>
    useQuery<{ data: T }, Error>("get", async () => axios.get(url), {
      refetchOnWindowFocus: false,
    });
  const post = <T>(url: string, data: any) =>
    useQuery<{ data: T }, Error>("get", async () => axios.post(url, data), {
      refetchOnWindowFocus: false,
    });

  return {
    get,
    post,
  };
};
