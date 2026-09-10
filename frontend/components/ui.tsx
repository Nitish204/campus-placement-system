import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function GlassPanel({
  children,
  className = "",
  glow = false,
  hoverable = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl border border-ink/[0.08] rounded-glass shadow-glass transition-all duration-200 ease-out ${
        glow ? "shadow-glow-violet" : ""
      } ${hoverable ? "hover:-translate-y-[4px] hover:scale-[1.015] hover:border-violet/25 hover:shadow-glow-violet cursor-pointer" : ""} ${className}`}
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
  // Unique interaction, not copied from the translate-lift pattern used
  // elsewhere: a two-tone gradient that's compressed into a 200%-wide
  // background, sitting off to one side at rest and sweeping into view
  // on hover via background-position - a "reveal" rather than a "lift".
  const base =
    "relative font-display font-semibold text-[0.95rem] px-6 py-3 rounded-full transition-all duration-300 ease-out disabled:opacity-40 disabled:pointer-events-none active:scale-[0.96] bg-[length:200%_100%] bg-left hover:bg-right";
  const styles = {
    primary: "text-white shadow-glow-violet bg-gradient-to-r from-violet via-violet to-coral",
    secondary: "text-ink border border-ink/15 bg-gradient-to-r from-white via-white to-violet/10 hover:text-violet",
    danger: "text-rose border border-rose/25 bg-gradient-to-r from-rose/5 via-rose/5 to-rose/15",
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
      {label && <span className="block text-sm text-muted mb-1.5 font-medium">{label}</span>}
      <input
        className={`w-full bg-white/60 border border-ink/10 rounded-xl px-4 py-2.5 text-ink placeholder:text-muted/50 outline-none focus:border-violet/40 focus:bg-white transition-colors ${className}`}
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
      {label && <span className="block text-sm text-muted mb-1.5 font-medium">{label}</span>}
      <textarea
        className={`w-full bg-white/60 border border-ink/10 rounded-xl px-4 py-2.5 text-ink placeholder:text-muted/50 outline-none focus:border-violet/40 focus:bg-white transition-colors resize-y ${className}`}
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
      {label && <span className="block text-sm text-muted mb-1.5 font-medium">{label}</span>}
      <select
        className={`w-full bg-white/60 border border-ink/10 rounded-xl px-4 py-2.5 text-ink outline-none focus:border-violet/40 transition-colors ${className}`}
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
    violet: "bg-violet/10 text-violet border-violet/25",
    emerald: "bg-emerald/10 text-emerald border-emerald/25",
    amber: "bg-amber/10 text-amber border-amber/25",
    rose: "bg-rose/10 text-rose border-rose/25",
    cyan: "bg-cyan/10 text-cyan border-cyan/25",
    muted: "bg-ink/5 text-muted border-ink/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, tone = "violet" }: { label: string; value: string | number; tone?: "violet" | "cyan" | "emerald" | "amber" }) {
  const colors: Record<string, string> = {
    violet: "text-violet", cyan: "text-cyan", emerald: "text-emerald", amber: "text-amber",
  };
  return (
    <GlassPanel className="p-5">
      <p className={`font-display font-bold text-3xl ${colors[tone]}`}>{value}</p>
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
