import { PATHS } from "../config"
import { logoutCall } from "../config/apiCalls";

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const emailRegexCheck = (value) => {
    return emailRegex.test(value);
}

export const passwordRegexCheck = (value) => {
    return passwordRegex.test(value);
}

export const firstNameError = 'Enter first name';
export const lastNameError = 'Enter last name';
export const emailError = 'Plase enter proper email address';
export const passwordError = (
    <div>
        <li>Password should be atleast 6 characters long</li>
        <li>Password should be atleast one uppercase letter</li>
        <li>Password should be atleast one lowercase letter</li>
        <li>Password should be atleast one numeric digit</li>
    </div>
)

export const userDropDownMenu = ['Logout'];
export const chatUserDropDownMenu = ['Details']

export const isAuthenticated = () => {
    return localStorage.getItem(PATHS.AUTH_KEY) ? true : false;
}

export const setAuthInfo = (data) => {
    localStorage.setItem(PATHS.AUTH_KEY, JSON.stringify(data));
}

export const getAuthInfo = () => {
    let data = localStorage.getItem(PATHS.AUTH_KEY);
    if (data) return JSON.parse(data);
    return null;
}

export const clearAuth = async () => {
    await logoutCall();
    localStorage.clear();
}

export const api = async (AxiosObj) => {
    try {
        const data = await AxiosObj;
        return [data, null];
    } catch (error) {
        return [null, error];
    }
}