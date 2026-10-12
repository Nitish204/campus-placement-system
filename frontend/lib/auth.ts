"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export type CurrentUser = {
  id: number;
  email: string;
  role: "student" | "company" | "admin";
  profile?: any;
};

// The session is an httpOnly cookie, so there is no token to read here.
// Pages start their own data fetches immediately (the cookie rides along
// automatically) while this hook verifies the role and loads the topbar
// identity in parallel. A missing or expired session makes any API call
// return 401, which sends the user to /login.
export function useAuth(requiredRole?: "student" | "company" | "admin") {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    api.me()
      .then((u) => {
        if (requiredRole && u.role !== requiredRole) {
          router.push(`/dashboard/${u.role}`);
          return;
        }
        setUser(u);
        setAuthChecked(true);
      })
      .catch(() => router.push("/login"));
  }, [router, requiredRole]);

  function logout() {
    api.logout().catch(() => {}).finally(() => router.push("/login"));
  }

  // "loading" kept for backward compatibility with pages that gate their
  // whole render on it - but pages should prefer using `token` directly
  // to start data fetches immediately, and only use `user`/`authChecked`
  // for the parts that actually need identity (email in the topbar, role).
  return { user, loading: !authChecked, authChecked, logout };
}

// The server has just set the session cookie; all that is left is to go to
// the right dashboard. Also drop any token an older version left behind.
export function redirectAfterAuth(role: string, router: any) {
  try { localStorage.removeItem("campus_token"); } catch {}
  router.push(`/dashboard/${role}`);
}
