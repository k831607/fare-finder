import { createBrowserRouter, Navigate } from "react-router";

import { RequireAuth } from "@/components/layout/require-auth";
import { NotFoundPage, RootErrorBoundary, RootLayout } from "@/components/layout/root-layout";
import AuthPage from "@/pages/Auth";
import AppPage from "@/pages/Dashboard";
import Index from "@/pages/Index";

/**
 * Client-side routes. Deep links (e.g. /app) are served index.html by the
 * SPA fallback in vercel.json, then resolved here in the browser.
 *
 * | Path       | Page                                 |
 * | ---------- | ------------------------------------ |
 * | /          | Landing page                         |
 * | /sign-in   | Auth page, sign-in tab               |
 * | /sign-up   | Auth page, sign-up tab               |
 * | /auth      | Redirects to /sign-in (legacy link)  |
 * | /app       | Dashboard (signed-in users only)     |
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/sign-in", element: <AuthPage initialMode="signin" /> },
      { path: "/sign-up", element: <AuthPage initialMode="signup" /> },
      { path: "/auth", element: <Navigate to="/sign-in" replace /> },
      {
        element: <RequireAuth />,
        children: [{ path: "/app", element: <AppPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
