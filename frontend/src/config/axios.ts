import axios from "axios";
import { ErrorData } from "@flowser/shared";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_HOST || "http://localhost:6061",
});

instance.interceptors.response.use(
  function (response) {
    // status codes within the 2xx range trigger this function
    return response;
  },
  function (error): ErrorData {
    // status codes outside the 2xx range trigger this function
    console.log("ERR", { error });
    throw (
      error.response.data.error ??
      ErrorData.fromPartial({
        message: "Unknown error",
      })
    );
  }
);

export default instance;
