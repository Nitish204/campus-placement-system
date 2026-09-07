"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell, NavTab } from "@/components/DashboardShell";
import { GlassPanel, StatCard, Badge } from "@/components/ui";

export default function AdminDashboard() {
  const { token, user, loading: authLoading, logout } = useAuth("admin");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) api.adminDashboard(token).then(setData);
  }, [token]);

  if (authLoading || !data) return <div className="min-h-screen flex items-center justify-center text-muted font-mono text-sm">loading…</div>;

  const chartData = data.branch_chart.labels.map((label: string, i: number) => ({
    branch: label, placed: data.branch_chart.data[i],
  }));

  return (
    <DashboardShell
      role="admin" email={user!.email} onLogout={logout}
      nav={
        <>
          <NavTab href="/dashboard/admin" active>Overview</NavTab>
          <NavTab href="/dashboard/admin/students" active={false}>Students</NavTab>
          <NavTab href="/dashboard/admin/companies" active={false}>Companies {data.stats.pending_companies_count > 0 && <span className="ml-1 text-amber">●</span>}</NavTab>
          <NavTab href="/dashboard/admin/jobs" active={false}>Jobs</NavTab>
          <NavTab href="/dashboard/admin/placements" active={false}>Placements</NavTab>
        </>
      }
    >
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="branch" tick={{ fill: "#9294b3", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#9294b3", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b0e1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e6e8f5" }} />
              <Bar dataKey="placed" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
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
              <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                <span className="text-ink">{p.student_name} → {p.company_name}</span>
                <span className="text-muted">{p.job_title} · {p.package}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </DashboardShell>
  );
}
