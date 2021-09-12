import Axios from 'axios';
import { getAuthInfo } from '../utils';

const axios = Axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

axios.interceptors.request.use(request => {
    const authInfo = getAuthInfo();
    if (authInfo) {
        request.headers['Authorization'] = authInfo.token;
    }

    return request;
});

// axios.interceptors.response.use(undefined, error => {
//     // if (error.response) {
//     //     if (error.response.status === 401) {
//     //         clearAuth();
//     //         window.location.href = "/";
//     //     }
//     // }

//     return Promise.reject(error);
// });

export default axios;