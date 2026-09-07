"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell, NavTab } from "@/components/DashboardShell";
import { GlassPanel, Badge } from "@/components/ui";

export default function AdminJobsPage() {
  const { token, user, loading: authLoading, logout } = useAuth("admin");
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (token) api.adminJobs(token).then((res) => setJobs(res.jobs));
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
          <NavTab href="/dashboard/admin/jobs" active>Jobs</NavTab>
          <NavTab href="/dashboard/admin/placements" active={false}>Placements</NavTab>
        </>
      }
    >
      <h1 className="font-display font-bold text-xl text-ink mb-6">All job postings ({jobs.length})</h1>
      <div className="space-y-3">
        {jobs.map((j) => (
          <GlassPanel key={j.id} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{j.title}</p>
              <p className="text-sm text-muted">{j.company_name} · {j.location} · {j.salary_range}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="muted">{j.application_count} applicants</Badge>
              <Badge tone={j.is_active ? "emerald" : "muted"}>{j.is_active ? "Active" : "Closed"}</Badge>
            </div>
          </GlassPanel>
        ))}
      </div>
    </DashboardShell>
  );
}
