"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserCategories, getUserTopics } from "@/lib/firebase/firestore";
import type { Category, Topic } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserCategories(user.uid),
      getUserTopics(user.uid),
    ]).then(([cats, tops]) => {
      setCategories(cats);
      setTopics(tops);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="animate-pulse text-text-secondary">Loading...</div>;

  const hasSetup = categories.length > 0;

  if (!hasSetup) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-border bg-surface p-12 text-center">
        <div className="text-5xl">🎬</div>
        <h2 className="text-xl font-bold text-text-primary">Welcome to TrendClips!</h2>
        <p className="max-w-md text-text-secondary">
          Get started by creating your first category, then add topics with search queries
          to start building your personalized video feed.
        </p>
        <Link
          href="/dashboard/categories"
          className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Create Your First Category →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="text-3xl font-bold text-accent">{categories.length}</div>
        <div className="text-sm text-text-secondary">Categories</div>
        {userProfile?.tier === "free" && (
          <div className="mt-1 text-xs text-text-secondary">
            {categories.length}/{userProfile.maxCategories} max
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="text-3xl font-bold text-accent">{topics.length}</div>
        <div className="text-sm text-text-secondary">Topics</div>
        {userProfile?.tier === "free" && (
          <div className="mt-1 text-xs text-text-secondary">
            {topics.length}/{userProfile.maxTopics} max
          </div>
        )}
      </div>
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="text-3xl font-bold text-accent capitalize">{userProfile?.tier || "free"}</div>
        <div className="text-sm text-text-secondary">Current Tier</div>
        {userProfile?.tier === "free" && (
          <Link href="/dashboard/settings" className="mt-1 text-xs text-accent hover:underline">
            Enter invite code →
          </Link>
        )}
      </div>
    </div>
  );
}
