// src/auth.ts
import { setCsrf } from "../lib/api";

const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/,"");
const url = (p: string) => /^https?:\/\//.test(p) ? p : `${API}${p}`;

export async function initCsrf(): Promise<void> {
    // Backend must return {"csrfToken": "<token>"} and set the cookie.
    const r = await fetch(url("/api/csrf/"), { credentials: "include" });
    const j = await r.json().catch(() => ({}));
    if (j?.csrfToken) setCsrf(j.csrfToken);
}

export async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(url(path), { credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
    // ensure we have a CSRF token first
    await initCsrf();
    const res = await fetch(url(path), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
