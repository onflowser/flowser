import axios from "./axios";
import { QueryClient } from "react-query";

const defaultQueryFn = async ({ queryKey }: any) => {
  const path = queryKey.filter((e: any) => typeof e !== "object");
  const params = queryKey.find((e: any) => typeof e === "object");
  return axios.get(path.join("/"), { params });
};

// provide the default query function to your app with defaultOptions
export default new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});
