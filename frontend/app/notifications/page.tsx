"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Button, Badge } from "@/components/ui";

export default function NotificationsPage() {
  const router = useRouter();
  const { token, user, loading: authLoading, logout } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);

  async function load() {
    if (!token) return;
    const res = await api.notifications(token);
    setNotifs(res.notifications);
  }
  useEffect(() => { if (token) load(); }, [token]);

  async function open(n: any) {
    if (!token) return;
    await api.openNotification(n.id, token);
    if (n.link) router.push(n.link);
    else await load();
  }

  async function markAllRead() {
    if (!token) return;
    await api.markAllRead(token);
    await load();
  }

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center text-muted font-mono text-sm">loading…</div>;

  return (
    <DashboardShell role={user.role} email={user.email} onLogout={logout}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-xl text-ink">Notifications</h1>
        <Button variant="secondary" onClick={markAllRead} className="!px-4 !py-2 text-xs">Mark all read</Button>
      </div>
      <div className="space-y-2 max-w-2xl">
        {notifs.length === 0 && <p className="text-sm text-muted">No notifications yet.</p>}
        {notifs.map((n) => (
          <button key={n.id} onClick={() => open(n)} className="block w-full text-left">
            <GlassPanel className={`p-4 flex items-center justify-between ${!n.is_read ? "border-violet/30" : ""}`}>
              <p className={`text-sm ${n.is_read ? "text-muted" : "text-ink"}`}>{n.message}</p>
              {!n.is_read && <Badge tone="violet">New</Badge>}
            </GlassPanel>
          </button>
        ))}
      </div>
    </DashboardShell>
  );
}
