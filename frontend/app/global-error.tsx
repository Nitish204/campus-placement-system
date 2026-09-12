"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled error in root layout:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#fdf6f0", color: "#1e1b2e", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "24px", marginBottom: "8px" }}>Something went wrong</h1>
            <p style={{ color: "#6b6478", marginBottom: "24px" }}>Please refresh the page.</p>
            <button
              onClick={reset}
              style={{ background: "linear-gradient(135deg,#4f46e5,#fb7185)", color: "#fff", border: "none", borderRadius: "100px", padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
