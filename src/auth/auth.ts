function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : null;
}

async function ensureCsrf(): Promise<void> {
    if (!getCookie("csrftoken")) {
        await fetch("/api/csrf/", {credentials: 'include'});
    }
}

export async function apiGet<T>(url: string): Promise<T> {
    const res = await fetch(url, {credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
    await ensureCsrf();
    const csrftoken = getCookie("csrftoken") || "";
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}