import axios from "./axios";
import { QueryClient, QueryFunction } from "react-query";

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const path = queryKey.filter((e) => typeof e !== "object");
  const params = queryKey.find((e) => typeof e === "object");
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
