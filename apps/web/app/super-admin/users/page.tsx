"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/I18nContext";
import { getAllUsers } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";

export default function UsersPage() {
  const { t } = useT();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse text-text-secondary">Loading...</div>;

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-text-primary">
        {t("adminUsers.allUsers", { count: users.length })}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminUsers.user")}</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminUsers.email")}</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminUsers.tier")}</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminUsers.inviteCode")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.avatarUrl && (
                      <img src={u.avatarUrl} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
                    )}
                    <span className="text-text-primary">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.tier === "admin" ? "bg-red-500/10 text-red-500" :
                    u.tier === "pro" ? "bg-green-500/10 text-green-500" :
                    "bg-gray-500/10 text-gray-500"
                  }`}>
                    {u.tier === "admin" ? t("adminUsers.superAdmin") : u.tier === "pro" ? t("adminUsers.pro") : t("adminUsers.free")}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{u.inviteCode || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
