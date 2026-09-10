"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoadingIntro } from "@/components/LoadingIntro";
import { GlassPanel, Button, Input, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { storeAuthAndRedirect } from "@/lib/auth";

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await api.registerCompany({
        company_name: fd.get("company_name"), email: fd.get("email"), password: fd.get("password"),
        industry: fd.get("industry"), description: fd.get("description"),
        website: fd.get("website"), location: fd.get("location"),
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
      <LoadingIntro />
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-lg">
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-bold text-lg text-ink">Campus Place</span>
        </Link>

        <GlassPanel className="p-8" glow>
          <h1 className="font-display font-bold text-2xl text-ink text-center">Register your company</h1>
          <p className="text-sm text-muted text-center mt-1.5 mb-7">
            Post jobs and hire from campus. Requires admin approval before you can post.
          </p>

          {error && <p className="text-sm text-rose bg-rose/10 border border-rose/20 rounded-lg px-3 py-2 mb-5">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Company name" name="company_name" required />
            <Input label="Work email" name="email" type="email" required />
            <Input label="Password" name="password" type="password" minLength={6} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Industry" name="industry" placeholder="Information Technology" required />
              <Input label="Location" name="location" placeholder="Bangalore" required />
            </div>
            <Input label="Website" name="website" placeholder="www.example.com" />
            <Textarea label="Description" name="description" rows={3} placeholder="What does your company do?" />

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Submitting…" : "Submit for approval"}
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-ink/[0.08] text-center text-sm text-muted">
            Already registered? <Link href="/login" className="text-violet font-medium hover:underline">Log in</Link>
          </div>
        </GlassPanel>
      </motion.div>
    </main>
  );
}
