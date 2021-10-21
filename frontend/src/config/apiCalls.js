import axios from './axios';
import { api, clearAuth, setAuthInfo } from '../utils';

export const checkUserCall = async () => {
    const [response, error] = await api(axios.get('/user/checkUser'));

    if (error) {
        return false;
    }

    if (response.data === true || response.data === false) {
        if (response.data === false) clearAuth();
        return response.data;
    } else {
        return false;
    }
}

export const registerCall = async (body, config) => {
    const [response, error] = await api(axios.post('/newUser', body, config));

    if (error) return { error: true, ...error.response.data };
    else if (response.data.error) return { ...response.data };
    else {
        setAuthInfo(response.data);
        return { error: false, ...response.data };
    }
}

export const loginCall = async (body) => {
    const [response, error] = await api(axios.post('/user', body));

    if (error) return { error: true, ...error.response.data };
    else if (response.data.error) return { ...response.data };
    else {
        setAuthInfo(response.data);
        return { error: false, ...response.data };
    }
}

export const logoutCall = async () => {
    const [response, error] = await api(axios.post('/user/logout'));

    if (error) {
        return false;
    }

    if (response.data === true) {
        return response.data;
    }

    else return false;
}