import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../auth/auth";
import { useAuth } from "../auth/authContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation() as never;
    const { refresh } = useAuth();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await apiPost("/api/login/", { username, password, remember });
            await refresh();
            const to = location.state?.from?.pathname || "/";
            navigate(to, { replace: true });
        } catch (err: never) {
            setError("Login failed");
        }
    };

    return (
        <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: "64px auto" }}>
            <h1>Sign in</h1>
            <label>
                Username
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
            </label>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button type="submit">Login</button>
        </form>
    );
}
