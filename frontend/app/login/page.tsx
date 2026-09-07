"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassPanel, Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { storeAuthAndRedirect } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await api.login(String(fd.get("email")), String(fd.get("password")));
      storeAuthAndRedirect(res.access_token, res.role, router);
    } catch (err: any) {
      setError(err.message || "Couldn't log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow orbs - the "redefined" visual signature for this page */}
      <div className="absolute top-[-10%] left-[10%] w-72 h-72 bg-violet/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-72 h-72 bg-cyan/15 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-bold text-lg text-ink">Campus Place</span>
        </Link>

        <GlassPanel className="p-8" glow>
          <h1 className="font-display font-bold text-2xl text-ink text-center">Welcome back</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">Log in to continue to your dashboard.</p>

          {error && <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2 mb-5">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
            <Input label="Password" name="password" type="password" required />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/10 text-center text-sm text-muted">
            New here?{" "}
            <Link href="/register/student" className="text-violet font-medium hover:underline">Register as student</Link>
            {" "}or{" "}
            <Link href="/register/company" className="text-cyan font-medium hover:underline">register your company</Link>
          </div>
        </GlassPanel>

        <p className="text-center text-xs text-muted mt-6">
          Admin? Use your admin email and password — you'll land on the admin console automatically.
        </p>
      </motion.div>
    </main>
  );
}
