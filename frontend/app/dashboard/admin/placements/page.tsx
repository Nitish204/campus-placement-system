"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Badge } from "@/components/ui";
import { SkeletonList } from "@/components/Skeleton";

export default function AdminPlacementsPage() {
  const { token, user, logout } = useAuth("admin");
  const [placements, setPlacements] = useState<any[] | null>(null);

  useEffect(() => {
    if (token) api.adminPlacements(token).then((res) => setPlacements(res.placements));
  }, [token]);

  return (
    <DashboardShell role="admin" email={user?.email || ""} onLogout={logout}>
      <h1 className="font-display font-bold text-xl text-ink mb-6">
        {placements ? `All placements (${placements.length})` : "All placements"}
      </h1>
      {!placements ? (
        <SkeletonList count={4} />
      ) : (
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
      )}
    </DashboardShell>
  );
}
