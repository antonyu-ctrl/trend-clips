"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "My Categories", href: "/dashboard/categories" },
  { label: "My Topics", href: "/dashboard/topics" },
  { label: "My Videos", href: "/dashboard/videos" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, userProfile } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Sign in Required</h1>
        <p className="text-text-secondary">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">My Dashboard</h1>
        {userProfile && (
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent capitalize">
            {userProfile.tier} tier
          </span>
        )}
      </div>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-surface p-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-accent text-white"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
