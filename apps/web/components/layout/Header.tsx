"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export function Header() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold text-accent sm:text-xl">Trend</span>
            <span className="text-lg font-bold text-text-primary sm:text-xl">Clips</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Home
            </Link>
            <Link
              href="/clips"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Clips
            </Link>
            <Link
              href="/shorts"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Shorts
            </Link>
            <Link
              href="/explore"
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-md bg-surface" />
            ) : user ? (
              <>
                <Link
                  href="/favorites"
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Favorites
                </Link>
                <Link
                  href="/suggest"
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Submit
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-md bg-accent/10 px-3 py-1 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    Admin
                  </Link>
                )}
                {user.photoURL ? (
                  <img
                    src={user.photoURL.replace("=s96-c", "=s64-c")}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border-2 border-border object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
                    {user.displayName?.[0] || "?"}
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="rounded-lg bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile: Sign in button (always visible) + hamburger */}
          {!loading && !user && (
            <button
              onClick={signInWithGoogle}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover md:hidden"
            >
              Sign in
            </button>
          )}
          {user?.photoURL && (
            <img
              src={user.photoURL.replace("=s96-c", "=s64-c")}
              alt=""
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full border-2 border-border object-cover md:hidden"
            />
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {[
              { href: "/", label: "Home" },
              { href: "/clips", label: "Clips" },
              { href: "/shorts", label: "Shorts" },
              { href: "/explore", label: "Explore" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <>
                <div className="my-2 border-t border-border" />
                <Link
                  href="/favorites"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Favorites
                </Link>
                <Link
                  href="/suggest"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Submit
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    Admin
                  </Link>
                )}
                <div className="my-2 border-t border-border" />
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
