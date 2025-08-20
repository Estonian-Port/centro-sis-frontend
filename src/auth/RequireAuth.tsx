import React, {JSX} from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./authContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    const location = useLocation();

    // While user is being resolved on first load, user===null. If you want a loader,
    // you can track a "loaded" flag. For brevity, redirect when not authenticated.
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
}
