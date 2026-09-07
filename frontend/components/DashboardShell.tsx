"use client";
import Link from "next/link";
import { Button } from "@/components/ui";

export function DashboardShell({
  role,
  email,
  onLogout,
  children,
  nav,
}: {
  role: string;
  email: string;
  onLogout: () => void;
  children: React.ReactNode;
  nav?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen pb-20">
      <header className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white text-sm">C</div>
            <span className="font-display font-bold text-ink">Campus Place</span>
            <span className="text-xs font-mono text-muted border border-white/10 rounded-full px-2.5 py-0.5 capitalize">{role}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="text-sm text-muted hover:text-ink transition-colors">Notifications</Link>
            <span className="text-sm text-muted hidden sm:inline">{email}</span>
            <Button variant="secondary" onClick={onLogout} className="!px-4 !py-2 text-xs">Log out</Button>
          </div>
        </div>
        {nav && <div className="max-w-6xl mx-auto px-6 pb-4 flex gap-2">{nav}</div>}
      </header>
      <div className="max-w-6xl mx-auto px-6 pt-8">{children}</div>
    </main>
  );
}

export function NavTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
        active ? "bg-white/10 text-ink" : "text-muted hover:text-ink hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}
