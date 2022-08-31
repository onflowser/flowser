import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_HOST || "http://localhost:6061",
});

instance.interceptors.response.use(
  function (response) {
    // status codes within the 2xx range trigger this function
    return response;
  },
  function (error) {
    // TODO(milestone-x): improve error handling (return and parse error info from backend)
    // status codes outside the 2xx range trigger this function
    return Promise.reject({
      message: error.response.statusText,
    });
  }
);

export default instance;
