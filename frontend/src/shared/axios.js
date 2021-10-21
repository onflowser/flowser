import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_HOST || 'http://localhost:3001',
});

instance.interceptors.response.use(
    function (response) {
        // status codes within the 2xx range trigger this function
        return response;
    },
    function (error) {
        // status codes outside of the 2xx range trigger this function
        return Promise.reject({
            // use error message returned from the server, otherwise use default error message
            message: error.response.data ? error.response.data.message : error.message,
            error,
        });
    },
);

export default instance;
