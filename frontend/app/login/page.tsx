"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Button, Input } from "@/components/ui";
import { LoadingIntro } from "@/components/LoadingIntro";
import { api } from "@/lib/api";
import { storeAuthAndRedirect } from "@/lib/auth";

// A number that visibly counts up on mount - the "interactive" element
// for this panel, in place of a static stat. Built with useMotionValue
// instead of a plain setInterval loop so the counting itself is driven
// by Framer's own animation engine (respects prefers-reduced-motion
// automatically, no separate cleanup logic to get wrong).
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [to]);

  return <span>{display}{suffix}</span>;
}

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
    <main className="min-h-screen grid md:grid-cols-2">
      <LoadingIntro />
      {/* Left panel: brand + live stats, not a centered card - a fixed
          info panel that gives the login screen actual content instead
          of empty space around a floating card. */}
      <div className="hidden md:flex flex-col justify-between bg-white/50 border-r border-ink/[0.08] p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-cyan/10 rounded-full blur-[120px] pointer-events-none" />

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-bold text-lg text-ink">Campus Place</span>
        </Link>

        <div className="relative z-10">
          <h1 className="font-display font-bold text-4xl text-ink leading-tight mb-4">
            Where placement<br />season gets simple.
          </h1>
          <p className="text-muted max-w-sm">
            Applications, AI-assisted screening, and live analytics for students, companies, and the placement cell.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 relative z-10">
          <div>
            <p className="font-display font-bold text-3xl text-violet"><CountUp to={6} /></p>
            <p className="text-xs text-muted mt-1">students placed</p>
          </div>
          <div>
            <p className="font-display font-bold text-3xl text-cyan"><CountUp to={4} /></p>
            <p className="text-xs text-muted mt-1">hiring companies</p>
          </div>
          <div>
            <p className="font-display font-bold text-3xl text-emerald"><CountUp to={9} /></p>
            <p className="text-xs text-muted mt-1">applications tracked</p>
          </div>
        </div>
      </div>

      {/* Right panel: the form itself, full-height, no floating card */}
      <div className="flex flex-col justify-center px-8 sm:px-16 py-16">
        <Link href="/" className="flex items-center gap-2.5 md:hidden mb-10">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-bold text-lg text-ink">Campus Place</span>
        </Link>

        <div className="max-w-sm w-full">
          <h2 className="font-display font-bold text-2xl text-ink">Welcome back</h2>
          <p className="text-sm text-muted mt-1.5 mb-8">Log in to continue to your dashboard.</p>

          {error && <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2 mb-5">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" name="email" type="email" placeholder="you@example.com" required autoFocus />
            <Input label="Password" name="password" type="password" required />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink/[0.08] text-sm text-muted">
            <p>New here?</p>
            <div className="flex gap-4 mt-2">
              <Link href="/register/student" className="text-violet font-medium hover:underline">Register as student</Link>
              <Link href="/register/company" className="text-cyan font-medium hover:underline">Register your company</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
