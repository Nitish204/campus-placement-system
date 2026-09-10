"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Badge } from "@/components/ui";
import { SkeletonList } from "@/components/Skeleton";

export default function AdminJobsPage() {
  const { token, user, logout } = useAuth("admin");
  const [jobs, setJobs] = useState<any[] | null>(null);

  useEffect(() => {
    if (token) api.adminJobs(token).then((res) => setJobs(res.jobs));
  }, [token]);

  return (
    <DashboardShell role="admin" email={user?.email || ""} onLogout={logout}>
      <h1 className="font-display font-bold text-xl text-ink mb-6">
        {jobs ? `All job postings (${jobs.length})` : "All job postings"}
      </h1>
      {!jobs ? (
        <SkeletonList count={5} />
      ) : (
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
      )}
    </DashboardShell>
  );
}
