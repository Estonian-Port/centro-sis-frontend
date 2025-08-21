import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

let CSRF: string | null = null;
export const setCsrf = (t: string | null) => { CSRF = t; };

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL?.replace(/\/+$/, ""),
    withCredentials: true,
});

api.interceptors.response.use(
    r => r,
    (error) => {
        const s = error?.response?.status;
        if (s === 401 || s === 403) {
            window.location.assign(`${import.meta.env.BASE_URL}login`);
        }
        return Promise.reject(error);
    }
);
api.defaults.headers.post["Content-Type"] = "application/json";

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // normalize headers to an AxiosHeaders instance (fixes TS2322)
    if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
    }
    const h = config.headers as AxiosHeaders;

    // attach CSRF if we have it (fallback to cookie)
    const cookieMatch = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
    const token = CSRF ?? (cookieMatch ? decodeURIComponent(cookieMatch[1]) : null);
    if (token) h.set("X-CSRFToken", token);

    return config;
});
