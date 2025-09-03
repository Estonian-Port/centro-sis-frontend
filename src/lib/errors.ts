// src/lib/errors.ts
import axios, { AxiosError } from "axios";

type ErrorBody = { detail?: string; error?: string; message?: string };

export function getErrorMessage(e: unknown): string {
    if (axios.isAxiosError(e)) {
        const ax = e as AxiosError<ErrorBody>;
        return (
            ax.response?.data?.detail ??
            ax.response?.data?.error ??
            ax.response?.data?.message ??
            ax.message
        );
    }
    if (e instanceof Error) return e.message;
    try { return JSON.stringify(e); } catch { return String(e); }
}

export function isAuthError(e: unknown): boolean {
    if (!axios.isAxiosError(e)) return false;
    const s = e.response?.status ?? 0;
    return s === 401 || s === 403;
}
