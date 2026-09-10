"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { GlassPanel, Button, Input, Textarea } from "@/components/ui";

export default function PostJobPage() {
  const router = useRouter();
  const { token, user, logout } = useAuth("company");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api.postJob({
        title: fd.get("title"), description: fd.get("description"),
        required_skills: fd.get("required_skills"), location: fd.get("location"),
        salary_range: fd.get("salary_range"), last_date: fd.get("last_date"),
      }, token);
      router.push("/dashboard/company");
    } catch (err: any) {
      setError(err.message || "Couldn't post the job.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <DashboardShell role="company" email={user?.email || ""} onLogout={logout}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
        <GlassPanel className="p-8" glow>
          <h1 className="font-display font-bold text-xl text-ink mb-6">Post a new job</h1>
          {error && <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2 mb-5">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Job title" name="title" required />
            <Textarea label="Description" name="description" rows={4} required />
            <Input label="Required skills (comma separated)" name="required_skills" placeholder="Python, React, SQL" required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location" name="location" required />
              <Input label="Salary range" name="salary_range" placeholder="8-12 LPA" required />
            </div>
            <Input label="Application deadline" name="last_date" type="date" required />
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Posting…" : "Post job"}
            </Button>
          </form>
        </GlassPanel>
      </motion.div>
    </DashboardShell>
  );
}
