import React, {JSX} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { user, loaded } = useAuth();
    const location = useLocation();
    if (!loaded) return null;                      // or a small loader
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
}
