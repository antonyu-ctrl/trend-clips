"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const { t } = useT();
  const pathname = usePathname();

  const navItems = [
    { label: t("admin.globalCategories"), href: "/super-admin" },
    { label: t("admin.globalTopics"), href: "/super-admin/topics" },
    { label: t("admin.inviteCodes"), href: "/super-admin/invites" },
    { label: t("admin.users"), href: "/super-admin/users" },
    { label: t("admin.videos"), href: "/super-admin/videos" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">{t("admin.accessDenied")}</h1>
        <p className="text-text-secondary">{t("admin.accessDeniedDesc")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Super Admin</h1>
        <p className="text-sm text-text-secondary">Manage global settings, users, and invite codes</p>
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
