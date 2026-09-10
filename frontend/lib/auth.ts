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

// Token is read synchronously from localStorage on mount - no network
// wait - so callers can start their own data fetch immediately instead
// of waiting for /auth/me to resolve first. The old version blocked
// dashboard pages behind a full /auth/me round-trip before they were
// even allowed to start fetching their own data - two sequential
// network calls stacked back-to-back instead of running in parallel.
// This hook now fetches /auth/me in the background for role
// verification and the topbar email, but doesn't gate anything else on it.
export function useAuth(requiredRole?: "student" | "company" | "admin") {
  const router = useRouter();
  const [token] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("campus_token") : null
  );
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    api.me(token)
      .then((u) => {
        if (requiredRole && u.role !== requiredRole) {
          router.push(`/dashboard/${u.role}`);
          return;
        }
        setUser(u);
        setAuthChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("campus_token");
        router.push("/login");
      });
  }, [router, requiredRole, token]);

  function logout() {
    localStorage.removeItem("campus_token");
    router.push("/login");
  }

  // "loading" kept for backward compatibility with pages that gate their
  // whole render on it - but pages should prefer using `token` directly
  // to start data fetches immediately, and only use `user`/`authChecked`
  // for the parts that actually need identity (email in the topbar, role).
  return { token, user, loading: !authChecked, authChecked, logout };
}

export function storeAuthAndRedirect(access_token: string, role: string, router: any) {
  localStorage.setItem("campus_token", access_token);
  router.push(`/dashboard/${role}`);
}

