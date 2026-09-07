import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function GlassPanel({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-glass shadow-glass ${
        glow ? "shadow-glow-violet" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const base =
    "font-display font-semibold text-[14px] px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    primary: "bg-accent-gradient text-white shadow-glow-violet hover:brightness-110 hover:-translate-y-[1px]",
    secondary: "bg-white/[0.06] border border-white/10 text-ink hover:bg-white/[0.1] hover:-translate-y-[1px]",
    danger: "bg-rose/10 border border-rose/30 text-rose hover:bg-rose/20",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm text-muted mb-1.5">{label}</span>}
      <input
        className={`w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-ink placeholder:text-muted/60 outline-none focus:border-violet/50 focus:bg-white/[0.06] transition-colors ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm text-muted mb-1.5">{label}</span>}
      <textarea
        className={`w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-ink placeholder:text-muted/60 outline-none focus:border-violet/50 focus:bg-white/[0.06] transition-colors resize-y ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm text-muted mb-1.5">{label}</span>}
      <select
        className={`w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-ink outline-none focus:border-violet/50 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({
  children,
  tone = "violet",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "violet" | "emerald" | "amber" | "rose" | "cyan" | "muted";
  className?: string;
}) {
  const tones: Record<string, string> = {
    violet: "bg-violet/15 text-violet border-violet/30",
    emerald: "bg-emerald/15 text-emerald border-emerald/30",
    amber: "bg-amber/15 text-amber border-amber/30",
    rose: "bg-rose/15 text-rose border-rose/30",
    cyan: "bg-cyan/15 text-cyan border-cyan/30",
    muted: "bg-white/5 text-muted border-white/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, tone = "violet" }: { label: string; value: string | number; tone?: "violet" | "cyan" | "emerald" | "amber" }) {
  const glow: Record<string, string> = {
    violet: "text-violet", cyan: "text-cyan", emerald: "text-emerald", amber: "text-amber",
  };
  return (
    <GlassPanel className="p-5">
      <p className={`font-display font-bold text-3xl ${glow[tone]}`}>{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </GlassPanel>
  );
}

export function statusTone(status: string): "violet" | "emerald" | "amber" | "rose" | "cyan" | "muted" {
  switch (status) {
    case "Placed": return "emerald";
    case "Shortlisted": return "cyan";
    case "Rejected": return "rose";
    case "approved": return "emerald";
    case "pending": return "amber";
    case "rejected": return "rose";
    default: return "violet";
  }
}
