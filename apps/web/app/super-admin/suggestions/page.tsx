"use client";

import { useState, useEffect } from "react";
import { getSuggestions, updateSuggestionStatus } from "@/lib/firebase/firestore";
import type { Suggestion, SuggestionStatus } from "@/lib/types";

type FilterTab = "pending" | "approved" | "rejected" | "all";

export default function SuperAdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("pending");

  async function loadSuggestions() {
    setLoading(true);
    const sug = await getSuggestions(filter === "all" ? undefined : filter as SuggestionStatus);
    setSuggestions(sug);
    setLoading(false);
  }

  useEffect(() => {
    loadSuggestions();
  }, [filter]);

  async function handleAction(sugId: string, status: "approved" | "rejected") {
    await updateSuggestionStatus(sugId, status);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === sugId ? { ...s, status } : s))
    );
  }

  const tabs: { label: string; value: FilterTab }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Suggestions</h1>
        <p className="text-sm text-text-secondary">
          Review community-submitted video URLs
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <a
                  href={sug.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline break-all"
                >
                  {sug.url}
                </a>
                <div className="mt-1 text-xs text-text-muted">
                  Platform: {sug.platform} · User: {sug.userId.slice(0, 8)}...
                  {" · "}
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      sug.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : sug.status === "approved"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {sug.status}
                  </span>
                </div>
              </div>
              {sug.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(sug.id, "approved")}
                    className="rounded-md bg-green-500/10 px-3 py-1 text-sm text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(sug.id, "rejected")}
                    className="rounded-md bg-red-500/10 px-3 py-1 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-text-muted">No suggestions with this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
