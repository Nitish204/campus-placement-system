"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Button, Badge, statusTone } from "@/components/ui";
import { SkeletonList } from "@/components/Skeleton";

export default function AdminCompaniesPage() {
  const { token, user, logout } = useAuth("admin");
  const [companies, setCompanies] = useState<any[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const res = await api.adminCompanies(token);
    setCompanies(res.companies);
  }
  useEffect(() => { if (token) load(); }, [token]);

  async function approve(id: number) {
    if (!token) return;
    setBusy(`approve-${id}`);
    try { await api.approveCompany(id, token); await load(); } finally { setBusy(null); }
  }

  async function reject(id: number) {
    if (!token) return;
    setBusy(`reject-${id}`);
    try { await api.rejectCompany(id, token); await load(); } finally { setBusy(null); }
  }

  return (
    <DashboardShell role="admin" email={user?.email || ""} onLogout={logout}>
      <h1 className="font-display font-bold text-xl text-ink mb-6">
        {companies ? `All companies (${companies.length})` : "All companies"}
      </h1>
      {!companies ? (
        <SkeletonList count={4} />
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <GlassPanel key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{c.company_name}</p>
                  <p className="text-sm text-muted">{c.email} · {c.industry} · {c.location}</p>
                  {c.description && <p className="text-sm text-muted mt-2 max-w-lg">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(c.approval_status)}>{c.approval_status}</Badge>
                  {c.approval_status === "pending" && (
                    <>
                      <Button onClick={() => approve(c.id)} disabled={busy === `approve-${c.id}`} className="!px-3 !py-1.5 text-xs">
                        {busy === `approve-${c.id}` ? "…" : "Approve"}
                      </Button>
                      <Button variant="danger" onClick={() => reject(c.id)} disabled={busy === `reject-${c.id}`} className="!px-3 !py-1.5 text-xs">
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
