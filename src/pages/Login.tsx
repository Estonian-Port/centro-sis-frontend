// src/pages/Login.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { initCsrf } from "../auth/auth";
import { useAuth } from "../auth/authContext";
import { getErrorMessage} from "../lib/errors";

type LocState = { from?: { pathname?: string } };

export default function Login() {
    // ✅ Hooks inside the component
    const { user, loaded, refresh } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const redirectTo = useMemo(
        () => ((loc.state as LocState | null)?.from?.pathname ?? "/"),
        [loc.state]
    );

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { void initCsrf(); }, []);

    // If already authenticated, leave login
    if (loaded && user) return <Navigate to={redirectTo} replace />;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await initCsrf(); // safe no-op if already set
            // ⬇️ Place your three lines here
            await api.post("/api/auth/login/", { username, password });
            await refresh();                                  // updates context.user
            nav(redirectTo, { replace: true });               // go to target
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
                <h1 className="mb-6 text-center text-2xl font-semibold">Sign in</h1>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {submitting ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
