"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/categories", label: "Categories", icon: "📁" },
  { href: "/admin/topics", label: "Topics", icon: "🔍" },
  { href: "/admin/videos", label: "Videos", icon: "🎬" },
  { href: "/admin/suggestions", label: "Suggestions", icon: "💡" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface/50">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold text-text-primary">Admin</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border p-4">
        <Link
          href="/"
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
