import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router";

import { supabase } from "@/integrations/supabase/client";

type AuthState =
  { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; user: User };

/**
 * Layout route for signed-in screens (replaces the TanStack `_authenticated` layout).
 * Checks the Supabase session on the client and redirects to /sign-in when there is
 * no user. Keep every signed-in route nested under this layout so access checks stay
 * centralized.
 */
export function RequireAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setState(
        error || !data.user ? { status: "signed-out" } : { status: "signed-in", user: data.user },
      );
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session?.user) setState({ status: "signed-out" });
      else if (event === "SIGNED_IN" || event === "USER_UPDATED")
        setState({ status: "signed-in", user: session.user });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state.status === "loading") return null;
  if (state.status === "signed-out") return <Navigate to="/sign-in" replace />;
  return <Outlet context={{ user: state.user } satisfies AuthenticatedContext} />;
}

type AuthenticatedContext = { user: User };

/** The signed-in user, for components rendered under <RequireAuth />. */
export function useAuthenticatedUser(): User {
  return useOutletContext<AuthenticatedContext>().user;
}
