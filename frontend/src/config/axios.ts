import axios from "axios";

const instance = axios.create({
  // TODO(milestone-5): provide config at runtime
  baseURL: "http://localhost:6061",
});

instance.interceptors.response.use(
  function (response) {
    // status codes within the 2xx range trigger this function
    return response;
  },
  function (error) {
    const data = error.response?.data;
    // status codes outside of the 2xx range trigger this function
    return Promise.reject({
      // use error message returned from the server, otherwise use default error message
      message: data ? data?.message : error.message,
      error: data ? data?.error : error.message,
    });
  }
);

export default instance;
