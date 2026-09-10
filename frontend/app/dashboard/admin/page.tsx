"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, StatCard, Badge } from "@/components/ui";
import { SkeletonStatRow, SkeletonCard } from "@/components/Skeleton";

export default function AdminDashboard() {
  const { token, user, logout } = useAuth("admin");
  const [data, setData] = useState<any>(null);

  // Fetches immediately on token - doesn't wait for the /auth/me role
  // check to resolve first, so this and the auth check run in parallel
  // instead of stacked sequentially.
  useEffect(() => {
    if (token) api.adminDashboard(token).then(setData);
  }, [token]);

  if (!user) {
    return (
      <DashboardShell role="admin" email="" onLogout={logout}>
        <SkeletonStatRow count={4} />
      </DashboardShell>
    );
  }

  const chartData = data ? data.branch_chart.labels.map((label: string, i: number) => ({
    branch: label, placed: data.branch_chart.data[i],
  })) : [];

  return (
    <DashboardShell role="admin" email={user.email} onLogout={logout}>
      {!data ? (
        <SkeletonStatRow count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Students" value={data.stats.total_students} tone="violet" />
            <StatCard label="Companies" value={data.stats.total_companies} tone="cyan" />
            <StatCard label="Jobs posted" value={data.stats.total_jobs} tone="amber" />
            <StatCard label="Placement rate" value={`${data.stats.placement_percentage}%`} tone="emerald" />
          </div>

          {data.stats.pending_companies_count > 0 && (
            <GlassPanel className="p-4 mb-8 flex items-center justify-between">
              <p className="text-sm text-ink">
                <Badge tone="amber" className="mr-2">{data.stats.pending_companies_count} pending</Badge>
                companies waiting on approval
              </p>
              <a href="/dashboard/admin/companies" className="text-sm text-violet font-medium hover:underline">Review now →</a>
            </GlassPanel>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <GlassPanel className="p-6">
              <h2 className="font-display font-semibold text-ink mb-4">Placements by branch</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,27,46,0.08)" />
                  <XAxis dataKey="branch" tick={{ fill: "#6b6478", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#6b6478", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid rgba(30,27,46,0.1)", borderRadius: 8, color: "#1e1b2e" }} />
                  <Bar dataKey="placed" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h2 className="font-display font-semibold text-ink mb-4">Top hiring companies</h2>
              <div className="space-y-3">
                {data.top_companies.length === 0 && <p className="text-sm text-muted">No placements recorded yet.</p>}
                {data.top_companies.map((c: any, i: number) => (
                  <div key={c.company_name} className="flex items-center justify-between">
                    <span className="text-sm text-ink">{i + 1}. {c.company_name}</span>
                    <Badge tone="emerald">{c.hired_count} hired</Badge>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          <div className="mt-6">
            <GlassPanel className="p-6">
              <h2 className="font-display font-semibold text-ink mb-4">Recent placements</h2>
              <div className="space-y-2">
                {data.recent_placements.length === 0 && <p className="text-sm text-muted">No placements yet.</p>}
                {data.recent_placements.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-ink/[0.05] last:border-0">
                    <span className="text-ink">{p.student_name} → {p.company_name}</span>
                    <span className="text-muted">{p.job_title} · {p.package}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
