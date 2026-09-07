"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell, NavTab } from "@/components/DashboardShell";
import { GlassPanel, Badge } from "@/components/ui";

export default function AdminPlacementsPage() {
  const { token, user, loading: authLoading, logout } = useAuth("admin");
  const [placements, setPlacements] = useState<any[]>([]);

  useEffect(() => {
    if (token) api.adminPlacements(token).then((res) => setPlacements(res.placements));
  }, [token]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted font-mono text-sm">loading…</div>;

  return (
    <DashboardShell
      role="admin" email={user!.email} onLogout={logout}
      nav={
        <>
          <NavTab href="/dashboard/admin" active={false}>Overview</NavTab>
          <NavTab href="/dashboard/admin/students" active={false}>Students</NavTab>
          <NavTab href="/dashboard/admin/companies" active={false}>Companies</NavTab>
          <NavTab href="/dashboard/admin/jobs" active={false}>Jobs</NavTab>
          <NavTab href="/dashboard/admin/placements" active>Placements</NavTab>
        </>
      }
    >
      <h1 className="font-display font-bold text-xl text-ink mb-6">All placements ({placements.length})</h1>
      <div className="space-y-3">
        {placements.map((p) => (
          <GlassPanel key={p.id} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{p.student_name} → {p.company_name}</p>
              <p className="text-sm text-muted">{p.job_title}</p>
            </div>
            <div className="text-right">
              <Badge tone="emerald">{p.package}</Badge>
              <p className="text-xs text-muted mt-1">{p.joining_date}</p>
            </div>
          </GlassPanel>
        ))}
        {placements.length === 0 && <p className="text-sm text-muted">No placements recorded yet.</p>}
      </div>
    </DashboardShell>
  );
}
