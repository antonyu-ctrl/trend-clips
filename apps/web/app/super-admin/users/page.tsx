"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";

export default function UsersPage() {
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
        All Users ({users.length})
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Email</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Tier</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Invite Code</th>
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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    u.tier === "invited" ? "bg-accent/10 text-accent" :
                    u.tier === "pro" ? "bg-green-500/10 text-green-500" :
                    "bg-gray-500/10 text-gray-500"
                  }`}>
                    {u.tier || "free"}
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
