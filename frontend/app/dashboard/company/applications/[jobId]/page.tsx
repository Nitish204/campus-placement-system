"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Button, Badge, statusTone } from "@/components/ui";

export default function ViewApplicationsPage() {
  const params = useParams();
  const jobId = Number(params.jobId);
  const { token, user, loading: authLoading, logout } = useAuth("company");
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const res = await api.viewApplications(jobId, token);
    setData(res);
  }

  useEffect(() => { if (token) load(); }, [token]);

  async function updateStatus(appId: number, status: string) {
    if (!token) return;
    setBusy(`${appId}-${status}`);
    try {
      await api.updateApplicationStatus(appId, status, "", token);
      await load();
    } catch (err) { /* surfaced inline via reload */ }
    setBusy(null);
  }

  async function runScreening() {
    if (!token) return;
    setBusy("screening");
    try {
      await api.runScreening(jobId, token);
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (authLoading || !data) return <div className="min-h-screen flex items-center justify-center text-muted font-mono text-sm">loading…</div>;

  return (
    <DashboardShell role="company" email={user!.email} onLogout={logout}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl text-ink">{data.job.title}</h1>
          <p className="text-sm text-muted">{data.applications.length} applicants, sorted by screening score</p>
        </div>
        <Button variant="secondary" onClick={runScreening} disabled={busy === "screening"}>
          {busy === "screening" ? "Re-scoring…" : "Re-run screening"}
        </Button>
      </div>

      <div className="space-y-3">
        {data.applications.map((a: any, i: number) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}>
            <GlassPanel className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{a.student_name}</p>
                <p className="text-sm text-muted">{a.student_email} · {a.student_branch} · CGPA {a.student_cgpa}</p>
                <p className="text-xs text-cyan font-mono mt-1">Screening score: {a.screening_score}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                {a.status === "Applied" && (
                  <>
                    <Button variant="secondary" onClick={() => updateStatus(a.id, "Shortlisted")} disabled={busy === `${a.id}-Shortlisted`} className="!px-3 !py-1.5 text-xs">Shortlist</Button>
                    <Button variant="danger" onClick={() => updateStatus(a.id, "Rejected")} disabled={busy === `${a.id}-Rejected`} className="!px-3 !py-1.5 text-xs">Reject</Button>
                  </>
                )}
                {a.status === "Shortlisted" && (
                  <Button onClick={() => updateStatus(a.id, "Placed")} disabled={busy === `${a.id}-Placed`} className="!px-3 !py-1.5 text-xs">Mark Placed</Button>
                )}
              </div>
            </GlassPanel>
          </motion.div>
        ))}
        {data.applications.length === 0 && <p className="text-sm text-muted">No applications yet for this job.</p>}
      </div>
    </DashboardShell>
  );
}
