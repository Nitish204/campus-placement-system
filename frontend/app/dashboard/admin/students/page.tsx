"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell, NavTab } from "@/components/DashboardShell";
import { GlassPanel, Button, Badge } from "@/components/ui";

export default function AdminStudentsPage() {
  const { token, user, loading: authLoading, logout } = useAuth("admin");
  const [students, setStudents] = useState<any[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    if (!token) return;
    const res = await api.adminStudents(token);
    setStudents(res.students);
  }
  useEffect(() => { if (token) load(); }, [token]);

  async function removeStudent(id: number) {
    if (!token) return;
    if (!confirm("Delete this student account? This also removes their applications and placement records.")) return;
    setBusy(id);
    try {
      await api.deleteUser(id, token);
      await load();
    } finally { setBusy(null); }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted font-mono text-sm">loading…</div>;

  return (
    <DashboardShell
      role="admin" email={user!.email} onLogout={logout}
      nav={
        <>
          <NavTab href="/dashboard/admin" active={false}>Overview</NavTab>
          <NavTab href="/dashboard/admin/students" active>Students</NavTab>
          <NavTab href="/dashboard/admin/companies" active={false}>Companies</NavTab>
          <NavTab href="/dashboard/admin/jobs" active={false}>Jobs</NavTab>
          <NavTab href="/dashboard/admin/placements" active={false}>Placements</NavTab>
        </>
      }
    >
      <h1 className="font-display font-bold text-xl text-ink mb-6">All students ({students.length})</h1>
      <div className="space-y-3">
        {students.map((s) => (
          <GlassPanel key={s.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{s.full_name} <span className="text-xs text-muted font-mono ml-2">{s.roll_number}</span></p>
              <p className="text-sm text-muted">{s.email} · {s.branch} · CGPA {s.cgpa}</p>
            </div>
            <div className="flex items-center gap-3">
              {s.has_resume ? <Badge tone="emerald">Resume ✓</Badge> : <Badge tone="amber">No resume</Badge>}
              <Button variant="danger" onClick={() => removeStudent(s.id)} disabled={busy === s.id} className="!px-3 !py-1.5 text-xs">
                {busy === s.id ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </GlassPanel>
        ))}
      </div>
    </DashboardShell>
  );
}
