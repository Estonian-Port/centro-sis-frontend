import * as React from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "./auth";
import { useAuth } from "./authContext";

export function useLogout() {
    const { refresh } = useAuth();
    const navigate = useNavigate();

    return React.useCallback(async () => {
        await apiPost("/api/logout/", {});
        await refresh();                // sets user=null
        navigate("/login", { replace: true });
    }, [refresh, navigate]);
}
