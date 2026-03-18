"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";

export function Header() {
  const { user, loading, isAdmin, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-accent">Trend</span>
            <span className="text-xl font-bold text-text-primary">Clips</span>
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

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-surface" />
          ) : user ? (
            <div className="flex items-center gap-3">
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
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-6 w-6 rounded-full"
                  />
                )}
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
