import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "./auth";

type User = { username: string } | null;

const AuthCtx = createContext<{ user: User; refresh: () => Promise<void> }>({
    user: null,
    refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);

    const refresh = async () => {
        try {
            const data = await apiGet<{ authenticated: boolean; username: string }>("/api/me/");
            setUser(data.authenticated ? { username: data.username } : null);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return <AuthCtx.Provider value={{ user, refresh }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    return useContext(AuthCtx);
}
