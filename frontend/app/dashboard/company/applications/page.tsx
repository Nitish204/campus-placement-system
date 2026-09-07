"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Button, Badge, StatCard, statusTone } from "@/components/ui";

export default function CompanyDashboard() {
  const { token, user, loading: authLoading, logout } = useAuth("company");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (token) api.companyDashboard(token).then(setData);
  }, [token]);

  if (authLoading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-muted font-mono text-sm">loading…</div>;
  }

  if (data.pending) {
    return (
      <DashboardShell role="company" email={user!.email} onLogout={logout}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto mt-16">
          <GlassPanel className="p-8 text-center" glow>
            <Badge tone="amber" className="mb-4">Pending approval</Badge>
            <h1 className="font-display font-bold text-xl text-ink mb-2">{data.company.company_name}</h1>
            <p className="text-sm text-muted">
              Your company is registered but waiting on admin approval before you can post jobs.
              You'll get a notification the moment it's approved.
            </p>
          </GlassPanel>
        </motion.div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="company" email={user!.email} onLogout={logout}>
      <div className="flex items-center justify-between mb-8">
        <div className="grid grid-cols-2 gap-4 flex-1 max-w-md">
          <StatCard label="Jobs posted" value={data.stats.total_jobs} tone="violet" />
          <StatCard label="Applications" value={data.stats.total_applications} tone="cyan" />
        </div>
        <Link href="/dashboard/company/post-job">
          <Button>+ Post a job</Button>
        </Link>
      </div>

      <h2 className="font-display font-semibold text-lg text-ink mb-4">Your job postings</h2>
      <div className="space-y-3">
        {data.jobs.length === 0 && <p className="text-sm text-muted">No jobs posted yet — post your first one above.</p>}
        {data.jobs.map((job: any) => (
          <GlassPanel key={job.id} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{job.title}</p>
              <p className="text-sm text-muted">{job.location} · {job.salary_range} · {job.application_count} applicants</p>
            </div>
            <Link href={`/dashboard/company/applications/${job.id}`}>
              <Button variant="secondary" className="!px-4 !py-2 text-xs">View applications</Button>
            </Link>
          </GlassPanel>
        ))}
      </div>
    </DashboardShell>
  );
}
