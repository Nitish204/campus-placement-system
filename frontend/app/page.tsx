"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { LoadingIntro } from "@/components/LoadingIntro";
import { GlassPanel, Button } from "@/components/ui";

const rise = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.9 + i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] } }),
};

const features = [
  { title: "Live Job Board", desc: "Real postings from approved companies, updated as they come in.", tone: "violet" },
  { title: "AI Screening", desc: "Resumes are automatically scored against each job's requirements.", tone: "cyan" },
  { title: "Live Analytics", desc: "Branch-wise placement stats and hiring trends, updated in real time.", tone: "emerald" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <LoadingIntro />
      <header className="flex items-center justify-between px-6 md:px-10 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent-gradient shadow-glow-violet flex items-center justify-center font-display font-bold text-white">C</div>
          <span className="font-display font-bold text-lg text-ink">Campus Place</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="secondary">Log in</Button></Link>
          <Link href="/register/student"><Button>Register as Student</Button></Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div variants={rise} initial="hidden" animate="show" custom={0} className="inline-flex">
          <span className="text-xs font-mono border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-cyan">
            ✨ PLACEMENT SEASON, SIMPLIFIED
          </span>
        </motion.div>

        <motion.h1
          variants={rise} initial="hidden" animate="show" custom={1}
          className="font-display font-bold text-[40px] md:text-[64px] leading-[1.05] tracking-tight mt-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-violet"
        >
          Where Talent Meets<br />the Right Opportunity
        </motion.h1>

        <motion.p
          variants={rise} initial="hidden" animate="show" custom={2}
          className="text-lg text-muted max-w-xl mx-auto mt-6"
        >
          One platform for students, recruiters, and placement cells — applications,
          AI-assisted screening, and real-time placement analytics, all in one place.
        </motion.p>

        <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="flex justify-center gap-4 mt-9">
          <Link href="/login"><Button>Log in</Button></Link>
          <Link href="/register/company"><Button variant="secondary">Register your company</Button></Link>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}>
            <GlassPanel className="p-6 h-full" glow={i === 0}>
              <h3 className="font-display font-semibold text-lg text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </section>

      <footer className="text-center text-xs text-muted pb-10">
        © 2026 Campus Placement Management System
      </footer>
    </main>
  );
}
