import { PATHS } from "../config";
import { logoutCall } from "../config/apiCalls";

export const apiUrl = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;

export const errorMsgClass = 'mb-4 d-block text-danger border border-danger rounded py-2 text-center bg-danger bg-opacity-10';

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const emailRegexCheck = (value) => {
    return emailRegex.test(value);
}

export const passwordRegexCheck = (value) => {
    return passwordRegex.test(value);
}

export const profilepic = 'Upload profile picture';
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

export const userDropDownMenu = ['My Profile', 'Logout'];
export const chatUserDropDownMenu = ['Details'];

export const successToastStyles = {
    backgroundColor: '#fff',
    color: '#5cb85c',
    border: '1px solid #5cb85c'
}

export const successToastIconTheme = {
    primary: '#5cb85c',
    secondary: '#fff'
}

export const errorToastStyles = {
    backgroundColor: '#fff',
    color: '#d9534f',
    border: '1px solid #d9534f'
}

export const infoToastStyles = {
    backgroundColor: '#fff',
    color: '#5bc0de',
    border: '1px solid #5bc0de'
}

export const infoToastIconTheme = {
    primary: '#5bc0de',
    secondary: '#fff'
}

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