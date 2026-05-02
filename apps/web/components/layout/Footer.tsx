"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-sm text-text-secondary sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} TrendClips, a subsidiary of Pay4World.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </Link>
            <a
              href="mailto:byunguk.yu@gmail.com"
              className="hover:text-text-primary transition-colors"
            >
              Contact
            </a>
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              YouTube ToS
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
