"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";

// Sidebar navigation instead of a top tab bar. This is a genuine layout
// change, not a palette swap: nav items are now defined once here per
// role instead of every admin sub-page redeclaring the same five tabs
// (that duplication is gone), and the persistent left rail is a
// different information architecture than horizontal tabs - it scales
// better as more sections get added later without the header getting
// crowded.
const NAV_BY_ROLE: Record<string, { href: string; label: string }[]> = {
  student: [{ href: "/dashboard/student", label: "Dashboard" }],
  company: [{ href: "/dashboard/company", label: "Dashboard" }],
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/students", label: "Students" },
    { href: "/dashboard/admin/companies", label: "Companies" },
    { href: "/dashboard/admin/jobs", label: "Jobs" },
    { href: "/dashboard/admin/placements", label: "Placements" },
  ],
};

export function DashboardShell({
  role,
  email,
  onLogout,
  children,
}: {
  role: string;
  email: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-ink/[0.08] bg-white/60 backdrop-blur-xl flex flex-col justify-between py-6 px-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white text-sm">C</div>
            <span className="font-display font-bold text-ink text-sm">Campus Place</span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                    active ? "bg-violet/15 text-violet" : "text-muted hover:text-ink hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/notifications"
              aria-current={pathname === "/notifications" ? "page" : undefined}
              className={`block text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                pathname === "/notifications" ? "bg-violet/15 text-violet" : "text-muted hover:text-ink hover:bg-white/5"
              }`}
            >
              Notifications
            </Link>
          </nav>
        </div>

        <div className="px-2">
          <p className="text-xs text-muted truncate mb-2">{email}</p>
          <Button variant="secondary" onClick={onLogout} className="w-full !py-2 text-xs">Log out</Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 md:px-12 py-10 pb-20">{children}</main>
    </div>
  );
}
