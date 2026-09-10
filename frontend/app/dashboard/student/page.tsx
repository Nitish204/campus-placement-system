"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Button, Badge, StatCard, statusTone } from "@/components/ui";
import { SkeletonStatRow, SkeletonList } from "@/components/Skeleton";

export default function StudentDashboard() {
  const { token, user, logout } = useAuth("student");
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const res = await api.studentDashboard(token);
    setData(res);
  }

  useEffect(() => { if (token) load(); }, [token]);

  async function apply(jobId: number) {
    if (!token) return;
    setBusy(`apply-${jobId}`);
    try {
      const res = await api.applyJob(jobId, token);
      setStatus(res.message);
      await load();
    } catch (err: any) { setStatus(err.message); }
    setBusy(null);
  }

  async function withdraw(appId: number) {
    if (!token) return;
    setBusy(`withdraw-${appId}`);
    try {
      await api.withdrawApplication(appId, token);
      setStatus("Application withdrawn.");
      await load();
    } catch (err: any) { setStatus(err.message); }
    setBusy(null);
  }

  async function uploadResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setBusy("resume");
    try {
      const res = await api.uploadResume(file, token);
      setStatus(res.message);
      await load();
    } catch (err: any) { setStatus(err.message); }
    setBusy(null);
  }

  return (
    <DashboardShell role="student" email={user?.email || ""} onLogout={logout}>
      {!data ? (
        <SkeletonStatRow count={3} />
      ) : (
        <>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Applications" value={data.stats.total_applications} tone="violet" />
        <StatCard label="Shortlisted" value={data.stats.shortlisted} tone="cyan" />
        <StatCard label="Placed" value={data.stats.placed} tone="emerald" />
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-6">
          <GlassPanel className="p-5">
            <h3 className="font-display font-semibold text-ink">{data.student.full_name}</h3>
            <p className="text-sm text-muted">{data.student.branch} · CGPA {data.student.cgpa}</p>
            <p className="text-xs text-muted mt-1">{data.student.skills}</p>
            <div className="mt-4 pt-4 border-t border-ink/[0.08]">
              <p className="text-sm font-medium mb-2 text-ink">
                Resume {data.student.has_resume ? <Badge tone="emerald">Uploaded</Badge> : <Badge tone="amber">Missing</Badge>}
              </p>
              <label className="block">
                <span className="text-xs font-medium text-violet cursor-pointer hover:underline">
                  {busy === "resume" ? "Uploading…" : "Upload resume (PDF/TXT)"}
                </span>
                <input type="file" accept=".pdf,.txt" onChange={uploadResume} className="hidden" disabled={busy === "resume"} />
              </label>
            </div>
          </GlassPanel>

          {status && <p className="text-xs text-muted font-mono px-1">{status}</p>}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display font-semibold text-lg text-ink mb-4">Your applications</h2>
            {data.applications.length === 0 ? (
              <p className="text-sm text-muted">No applications yet — apply to a job below.</p>
            ) : (
              <div className="space-y-3">
                {data.applications.map((a: any) => (
                  <GlassPanel key={a.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink">{a.job_title}</p>
                      <p className="text-sm text-muted">{a.company_name} · Screening: {a.screening_score}%</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                      {a.status === "Applied" && (
                        <Button variant="danger" onClick={() => withdraw(a.id)} disabled={busy === `withdraw-${a.id}`} className="!px-3 !py-1.5 text-xs">
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </GlassPanel>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display font-semibold text-lg text-ink mb-4">Open positions</h2>
            <div className="space-y-3">
              <AnimatePresence>
                {data.active_jobs.map((job: any, i: number) => (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}>
                    <GlassPanel className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-ink">{job.title}</p>
                          <p className="text-sm text-muted">{job.company_name} · {job.location} · {job.salary_range}</p>
                        </div>
                        <Button onClick={() => apply(job.id)} disabled={busy === `apply-${job.id}`} className="!px-4 !py-2 text-xs whitespace-nowrap">
                          {busy === `apply-${job.id}` ? "Applying…" : "Apply"}
                        </Button>
                      </div>
                      <p className="text-sm text-muted mt-3">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(job.required_skills || "").split(",").filter(Boolean).map((s: string) => (
                          <Badge key={s} tone="muted">{s.trim()}</Badge>
                        ))}
                      </div>
                    </GlassPanel>
                  </motion.div>
                ))}
              </AnimatePresence>
              {data.active_jobs.length === 0 && <p className="text-sm text-muted">No open positions match right now — check back soon.</p>}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </DashboardShell>
  );
}
