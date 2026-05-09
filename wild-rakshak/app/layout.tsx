import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WILD RAKSHAK — AI Wildlife Conflict Prevention System",
  description:
    "AI-powered Human-Wildlife Conflict Prevention System for Himalayan regions. Real-time detection, threat analysis, and emergency alerts.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="tactical-bg min-h-screen">{children}</body>
    </html>
  );
}
