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

export function useAuth(requiredRole?: "student" | "company" | "admin") {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("campus_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    api.me(t)
      .then((u) => {
        if (requiredRole && u.role !== requiredRole) {
          router.push(`/dashboard/${u.role}`);
          return;
        }
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("campus_token");
        router.push("/login");
      });
  }, [router, requiredRole]);

  function logout() {
    localStorage.removeItem("campus_token");
    router.push("/login");
  }

  return { token, user, loading, logout };
}

export function storeAuthAndRedirect(access_token: string, role: string, router: any) {
  localStorage.setItem("campus_token", access_token);
  router.push(`/dashboard/${role}`);
}
