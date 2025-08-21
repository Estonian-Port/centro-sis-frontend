import "./index.css";
import { createRoot } from "react-dom/client";
import BaseLayout from "./layouts/BaseLayout";
import { RouterProvider, Navigate } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import RequireAuth from "./auth/RequireAuth";
import { AuthProvider } from "./auth/authContext"; // must expose AuthProvider
import Login from "./pages/Login";
import Home from "./pages/HomePage";
import Students from "./pages/StudentsPage";

const qc = new QueryClient();

const router = createBrowserRouter(
    [
        { path: "/login", element: <Login /> },

        {
            element: <RequireAuth><BaseLayout /></RequireAuth>,
            children: [
                { index: true, element: <Home /> },
                { path: "home", element: <Home /> },
                { path: "students", element: <Students /> },
            ],
        },

        { path: "*", element: <Navigate to="/" replace /> },
    ],
    {
        // Important for GitHub Pages project sites (e.g. /<repo>/)
        basename: import.meta.env.BASE_URL,
    }
);

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={qc}>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </QueryClientProvider>
);
