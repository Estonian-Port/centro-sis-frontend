import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "./auth";

type User = { id?: number; username: string } | null;

type Ctx = { user: User; loaded: boolean; refresh: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ user: null, loaded: false, refresh: async () => {} });


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loaded, setLoaded] = useState(false);

    const refresh = async () => {
        try {
            // Accept either {authenticated, username} or {id, username, ...}
            const data = await apiGet<any>("/api/me/");
            const isAuth = data?.authenticated === true || typeof data?.id === "number";
            setUser(isAuth ? { id: data.id, username: data.username } : null);
        } catch {
            setUser(null);
        } finally {
            setLoaded(true);
        }
    };

    useEffect(() => { void refresh(); }, []);

    return <AuthCtx.Provider value={{ user, loaded, refresh }}>{children}</AuthCtx.Provider>;
}


export const useAuth = () => useContext(AuthCtx);
