import type { Metadata } from "next";
import "./globals.css";

// Outfit (display) + Plus Jakarta Sans (body) via next/font/google in a
// real environment. Commented out here since this sandbox has no network
// access to fonts.googleapis.com at build time - uncomment on your machine:
//
//   import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
//   const outfit = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500","700"] });
//   const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400","500","600"] });
//   then add `${outfit.variable} ${jakarta.variable}` to <html> className below.

export const metadata: Metadata = {
  title: "Campus Place — Where Talent Meets the Right Opportunity",
  description: "Placement portal for students, companies, and the placement cell.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-app-gradient min-h-screen">{children}</body>
    </html>
  );
}
