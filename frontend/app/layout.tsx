import type { Metadata } from "next";
import "./globals.css";

// Uses next/font/google for Space Grotesk + Inter in a real environment
// (self-hosts at build time). Commented out here since this sandbox has
// no network access to fonts.googleapis.com at build time - uncomment on
// your machine:
//
//   import { Space_Grotesk, Inter } from "next/font/google";
//   const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", weight: ["500","700"] });
//   const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400","500","600"] });
//   then add `${grotesk.variable} ${inter.variable}` to <html> className below.

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
