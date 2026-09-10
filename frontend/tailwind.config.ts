import type { Config } from "tailwindcss";

// Light glassmorphism - deliberately not a straight inversion of the dark
// palette (that would just be "dark theme with colors swapped"). Base is
// a warm cream/blush gradient instead of flat white, glass panels are
// tinted white with a soft warm shadow instead of a colored glow, and the
// accent trio (indigo/coral/amber) is chosen to read clearly against a
// light background specifically - the old violet/cyan pairing was tuned
// for contrast against near-black and looks washed out on light surfaces.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#fdf6f0",
        surface: "#ffffff",
        violet: "#4f46e5",
        indigo: "#4f46e5",
        cyan: "#0d9488",
        emerald: "#059669",
        amber: "#d97706",
        rose: "#e11d48",
        coral: "#fb7185",
        ink: "#1e1b2e",
        muted: "#6b6478",
      },
      fontFamily: {
        display: ["'Outfit'", "system-ui", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "app-gradient":
          "radial-gradient(circle at 10% 0%, rgba(79,70,229,0.10), transparent 45%), radial-gradient(circle at 90% 15%, rgba(251,113,133,0.10), transparent 45%), linear-gradient(180deg, #fdf6f0 0%, #fdf6f0 100%)",
        "accent-gradient": "linear-gradient(135deg, #4f46e5, #fb7185)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(30,27,46,0.08)",
        "glow-violet": "0 8px 28px rgba(79,70,229,0.22)",
        "glow-cyan": "0 8px 28px rgba(13,148,136,0.18)",
      },
      borderRadius: {
        glass: "20px",
      },
      fontSize: {
        xs: ["0.8rem", { lineHeight: "1.2rem" }],
        sm: ["0.925rem", { lineHeight: "1.4rem" }],
        base: ["1.0625rem", { lineHeight: "1.65rem" }],
        lg: ["1.2rem", { lineHeight: "1.8rem" }],
        xl: ["1.4rem", { lineHeight: "1.9rem" }],
        "2xl": ["1.7rem", { lineHeight: "2.1rem" }],
        "3xl": ["2.1rem", { lineHeight: "2.4rem" }],
        "4xl": ["2.6rem", { lineHeight: "2.8rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
