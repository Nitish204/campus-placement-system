import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#05060d",          // near-black navy page background
        surface: "#0b0e1a",       // slightly lifted panel background (non-glass contexts)
        violet: "#8b5cf6",
        indigo: "#6366f1",
        cyan: "#22d3ee",
        emerald: "#34d399",
        amber: "#fbbf24",
        rose: "#fb7185",
        ink: "#e6e8f5",           // primary text on dark bg
        muted: "#9294b3",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "app-gradient":
          "radial-gradient(circle at 15% 0%, rgba(139,92,246,0.18), transparent 40%), radial-gradient(circle at 85% 20%, rgba(34,211,238,0.12), transparent 40%), linear-gradient(180deg, #05060d 0%, #05060d 100%)",
        "accent-gradient": "linear-gradient(135deg, #8b5cf6, #6366f1)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        "glow-violet": "0 0 24px rgba(139,92,246,0.35)",
        "glow-cyan": "0 0 24px rgba(34,211,238,0.25)",
      },
      borderRadius: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
