"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useT } from "@/lib/i18n/I18nContext";
import { createInviteCode, getInviteCodes } from "@/lib/firebase/firestore";
import type { InviteCode } from "@/lib/types";

export default function InviteCodesPage() {
  const { user } = useAuth();
  const { t } = useT();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadCodes = async () => {
    const data = await getInviteCodes();
    setCodes(data);
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    await createInviteCode(user.uid);
    await loadCodes();
    setCreating(false);
  };

  if (loading) return <div className="animate-pulse text-text-secondary">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{t("adminInvites.title")}</h2>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {creating ? t("adminInvites.creating") : t("adminInvites.generateCode")}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminInvites.code")}</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminInvites.status")}</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">{t("adminInvites.usedBy")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.map((c) => (
              <tr key={c.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-mono text-text-primary">{c.id}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.isUsed ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {c.isUsed ? t("adminInvites.used") : t("adminInvites.available")}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{c.usedBy || "—"}</td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-text-secondary">
                  {t("adminInvites.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
