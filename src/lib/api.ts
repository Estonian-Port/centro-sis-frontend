import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

let CSRF: string | null = null;
export const setCsrf = (t: string | null) => { CSRF = t; };

// --- baseURL: required and forced to HTTPS ---
const raw = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
if (!raw) throw new Error("VITE_API_URL is required (e.g. https://api.centrosis.tenri.com.ar/api)");
const baseURL = raw.replace(/^http:\/\//i, "https://"); // harden against accidental http
if (!/^https:\/\//i.test(baseURL) && window.isSecureContext) {
    throw new Error(`VITE_API_URL must be https in secure contexts. Got: ${raw}`);
}

export const api = axios.create({
    baseURL,
    withCredentials: true, // send cookies for session auth
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
});

// default headers
api.defaults.headers.post["Content-Type"] = "application/json";

// attach CSRF token from memory or cookie
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
    }
    const h = config.headers as AxiosHeaders;

    const cookieMatch = document.cookie.match(/(?:^|; )csrftoken=([^;]+)/);
    const token = CSRF ?? (cookieMatch ? decodeURIComponent(cookieMatch[1]) : null);
    if (token) h.set("X-CSRFToken", token);

    return config;
});

// redirect to login only on real 401/403, not on network/mixed-content errors
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
