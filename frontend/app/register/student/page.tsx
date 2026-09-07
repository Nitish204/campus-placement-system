"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassPanel, Button, Input, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { storeAuthAndRedirect } from "@/lib/auth";

const branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"];

export default function RegisterStudentPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await api.registerStudent({
        full_name: fd.get("full_name"), email: fd.get("email"), password: fd.get("password"),
        roll_number: fd.get("roll_number"), branch: fd.get("branch"), cgpa: fd.get("cgpa"),
        passing_year: fd.get("passing_year"), phone: fd.get("phone"), skills: fd.get("skills"),
      });
      storeAuthAndRedirect(res.access_token, res.role, router);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-bold text-lg text-ink">Campus Place</span>
        </Link>

        <GlassPanel className="p-8" glow>
          <h1 className="font-display font-bold text-2xl text-ink text-center">Student registration</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">Apply to companies and track your placements.</p>

          {error && <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2 mb-5">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full name" name="full_name" required />
              <Input label="Roll number" name="roll_number" required />
            </div>
            <Input label="Email" name="email" type="email" required />
            <Input label="Password" name="password" type="password" minLength={6} required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Branch" name="branch" required defaultValue="">
                <option value="" disabled>Select branch</option>
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
              <Input label="CGPA" name="cgpa" type="number" step="0.01" min="0" max="10" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Passing year" name="passing_year" type="number" min="2024" max="2030" required />
              <Input label="Phone" name="phone" type="tel" required />
            </div>
            <Input label="Skills (comma separated)" name="skills" placeholder="Python, React, SQL" required />

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/10 text-center text-sm text-muted">
            Already have an account? <Link href="/login" className="text-violet font-medium hover:underline">Log in</Link>
          </div>
        </GlassPanel>
      </motion.div>
    </main>
  );
}
