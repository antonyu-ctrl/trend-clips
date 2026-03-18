"use client";

import { useState, useEffect } from "react";
import { getCategories, getTopics } from "@/lib/firebase/firestore";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";

interface Stats {
  totalVideos: number;
  activeVideos: number;
  categories: number;
  topics: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const db = getClientDb();
        const videosCol = collection(db, "videos");

        const [totalSnap, activeSnap, cats, topics] = await Promise.all([
          getCountFromServer(videosCol),
          getCountFromServer(query(videosCol, where("status", "==", "active"))),
          getCategories(),
          getTopics(),
        ]);

        setStats({
          totalVideos: totalSnap.data().count,
          activeVideos: activeSnap.data().count,
          categories: cats.length,
          topics: topics.length,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Videos", value: stats?.totalVideos ?? 0, icon: "🎬" },
    { label: "Active Videos", value: stats?.activeVideos ?? 0, icon: "✅" },
    { label: "Categories", value: stats?.categories ?? 0, icon: "📁" },
    { label: "Topics", value: stats?.topics ?? 0, icon: "🔍" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-2 text-2xl">{card.icon}</div>
            <div className="text-3xl font-bold text-text-primary">{card.value}</div>
            <div className="mt-1 text-sm text-text-secondary">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-2 text-lg font-semibold text-text-primary">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/categories"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Manage Categories
          </a>
          <a
            href="/admin/topics"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Manage Topics
          </a>
          <a
            href="/admin/suggestions"
            className="rounded-lg bg-surface-hover px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface transition-colors border border-border"
          >
            Review Suggestions
          </a>
        </div>
      </div>
    </div>
  );
}
