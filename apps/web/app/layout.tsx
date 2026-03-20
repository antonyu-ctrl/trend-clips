import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "TrendClips — Trending YouTube Clips & Shorts",
  description:
    "Discover the best trending YouTube clips and Shorts, organized by topic and ranked by popularity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <I18nProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
